import { normalizeListItem, normalizeProductDetail, type RawProductDetail } from "./transform";

import type { ApiErrorBody, FetchProductsParams, ProductDetail, ProductListItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

const FETCH_TIMEOUT_MS = 30_000;

const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 750;

const SERVER_ERROR_STATUS = 500;
const NOT_FOUND_STATUS = 404;

/* eslint-disable functional/no-classes, functional/no-this-expressions */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
/* eslint-enable functional/no-classes, functional/no-this-expressions */

const isApiErrorBody = (body: unknown): body is ApiErrorBody =>
  typeof body === "object"
  && body !== null
  && "error" in body
  && typeof body.error === "string"
  && "message" in body
  && typeof body.message === "string";

const readErrorBody = async (response: Response): Promise<ApiErrorBody | null> => {
  try {
    const body: unknown = await response.json();
    return isApiErrorBody(body) ? body : null;
  } catch {
    return null;
  }
};

const apiError = async (response: Response, context: string): Promise<ApiError> => {
  const body = await readErrorBody(response);
  return new ApiError(
    body ? `${context}: ${body.message}` : `${context} failed with status ${response.status}`,
    response.status,
    body?.error,
  );
};

const buildHeaders = (): HeadersInit => ({ "x-api-key": API_KEY });

const readJson = async <T>(response: Response): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (await response.json()) as T;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const retryDelayFor = (attempt: number): number => RETRY_DELAY_MS * (attempt + 1);

const buildUrl = (path: string, searchParams: Readonly<Record<string, string>> = {}): string => {
  const query = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => value !== ""),
  ).toString();
  const url = `${API_BASE_URL}${path}`;
  return query === "" ? url : `${url}?${query}`;
};

export interface RequestOptions {
  signal?: AbortSignal;
  retries?: number;
}

const apiFetchOnce = async (url: string, signal?: AbortSignal): Promise<Response> => {
  const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  return fetch(url, { headers: buildHeaders(), signal: combined });
};

const isFinalAttempt = (attempt: number, options: RequestOptions): boolean =>
  attempt >= (options.retries ?? RETRY_ATTEMPTS) || options.signal?.aborted === true;

const apiFetchWithRetry = async (
  url: string,
  options: RequestOptions,
  attempt = 0,
): Promise<Response> => {
  const isFinal = isFinalAttempt(attempt, options);

  const retry = async (): Promise<Response> => {
    await delay(retryDelayFor(attempt));
    return apiFetchWithRetry(url, options, attempt + 1);
  };

  try {
    const response = await apiFetchOnce(url, options.signal);
    return response.status >= SERVER_ERROR_STATUS && !isFinal ? await retry() : response;
  } catch (error) {
    if (isFinal) {
      throw error;
    }
    return await retry();
  }
};

const apiFetch = async (
  path: string,
  searchParams: Readonly<Record<string, string>> = {},
  options: RequestOptions = {},
): Promise<Response> => apiFetchWithRetry(buildUrl(path, searchParams), options);

export const fetchProducts = async (
  params: FetchProductsParams = {},
  options: RequestOptions = {},
): Promise<readonly ProductListItem[]> => {
  const { search, limit, offset } = params;
  const response = await apiFetch(
    "/products",
    {
      search: search ?? "",
      limit: limit === undefined ? "" : String(limit),
      offset: offset === undefined ? "" : String(offset),
    },
    options,
  );

  if (!response.ok) {
    throw await apiError(response, "fetchProducts");
  }

  const products = await readJson<readonly ProductListItem[]>(response);
  return products.map((product) => normalizeListItem(product));
};

export const fetchProductById = async (
  id: string,
  options: RequestOptions = {},
): Promise<ProductDetail | null> => {
  const response = await apiFetch(`/products/${encodeURIComponent(id)}`, {}, options);

  if (response.status === NOT_FOUND_STATUS) {
    return null;
  }

  if (!response.ok) {
    throw await apiError(response, `fetchProductById(${id})`);
  }

  return normalizeProductDetail(await readJson<RawProductDetail>(response));
};
