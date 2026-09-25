import { normalizeListItem, normalizeProductDetail, type RawProductDetail } from "./transform";

import type { ApiErrorBody, FetchProductsParams, ProductDetail, ProductListItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

const FETCH_TIMEOUT_MS = 30_000;

const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 750;

const SERVER_ERROR_STATUS = 500;
const NOT_FOUND_STATUS = 404;

/**
 * `Error` subclassing is the platform's own contract for failures: it is what
 * gives callers `instanceof`, a stack trace and correct logging. A plain tagged
 * object would lose all three, so this is the one class the codebase keeps.
 */
/* eslint-disable functional/no-classes, functional/no-this-expressions -- see the note above */
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

/**
 * The API ships no runtime schema, so a caller's type argument is a trusted
 * assertion rather than a checked guarantee. Funnelling every response through
 * here keeps that to one auditable place to validate once a schema exists.
 */
const readJson = async <T>(response: Response): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (await response.json()) as T;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** Back off a little further on each successive retry. */
const retryDelayFor = (attempt: number): number => RETRY_DELAY_MS * (attempt + 1);

const buildUrl = (path: string, searchParams: Readonly<Record<string, string>> = {}): string => {
  const query = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => value !== ""),
  ).toString();
  const url = new URL(path, API_BASE_URL).toString();
  return query === "" ? url : `${url}?${query}`;
};

const apiFetchOnce = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { headers: buildHeaders(), signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Retries transport failures and 5xx responses, recursing rather than looping so
 * each attempt is a value handed to the next rather than shared mutable state.
 */
const apiFetchWithRetry = async (url: string, attempt = 0): Promise<Response> => {
  const isFinalAttempt = attempt >= RETRY_ATTEMPTS;

  const retry = async (): Promise<Response> => {
    await delay(retryDelayFor(attempt));
    return apiFetchWithRetry(url, attempt + 1);
  };

  try {
    const response = await apiFetchOnce(url);
    return response.status >= SERVER_ERROR_STATUS && !isFinalAttempt ? await retry() : response;
  } catch (error) {
    if (isFinalAttempt) {
      throw error;
    }
    return await retry();
  }
};

const apiFetch = async (
  path: string,
  searchParams?: Readonly<Record<string, string>>,
): Promise<Response> => apiFetchWithRetry(buildUrl(path, searchParams));

export const fetchProducts = async (
  params: FetchProductsParams = {},
): Promise<readonly ProductListItem[]> => {
  const { search, limit, offset } = params;
  const response = await apiFetch("/products", {
    search: search ?? "",
    limit: limit === undefined ? "" : String(limit),
    offset: offset === undefined ? "" : String(offset),
  });

  if (!response.ok) {
    throw await apiError(response, "fetchProducts");
  }

  const products = await readJson<readonly ProductListItem[]>(response);
  return products.map((product) => normalizeListItem(product));
};

export const fetchProductById = async (id: string): Promise<ProductDetail | null> => {
  const response = await apiFetch(`/products/${encodeURIComponent(id)}`);

  if (response.status === NOT_FOUND_STATUS) {
    return null;
  }

  if (!response.ok) {
    throw await apiError(response, `fetchProductById(${id})`);
  }

  return normalizeProductDetail(await readJson<RawProductDetail>(response));
};
