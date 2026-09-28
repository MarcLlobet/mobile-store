import { normalizeList, normalizeProductDetail, type RawProductDetail } from "./transform";

import type { ApiErrorBody, FetchProductsParams, ProductDetail, ProductListItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

const FETCH_TIMEOUT_MS = 30_000;

const NOT_FOUND_STATUS = 404;

type QueryParams = Record<string, string | number | undefined>;

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
    const body = await response.json<ApiErrorBody>();
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

const buildUrl = (path: string, params: QueryParams): string => {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${API_BASE_URL}${path}`;
  return query === "" ? url : `${url}?${query}`;
};

const apiRequest = async <T>(path: string, params: QueryParams = {}): Promise<T> => {
  const url = buildUrl(path, params);
  const headers = new Headers({ "x-api-key": API_KEY });
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw await apiError(response, url);
  }

  return await response.json<T>();
};

export const fetchProducts = async (
  params: FetchProductsParams = {},
): Promise<readonly ProductListItem[]> => {
  const { search, limit, offset } = params;
  const json = await apiRequest<ProductListItem[]>("/products", {
    search,
    limit,
    offset,
  });
  return normalizeList(json);
};

export const fetchProductById = async (id: string): Promise<ProductDetail | null> => {
  try {
    const rawProductDetail = await apiRequest<RawProductDetail>(
      `/products/${encodeURIComponent(id)}`,
    );
    return normalizeProductDetail(rawProductDetail);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      return null;
    }
    throw error;
  }
};
