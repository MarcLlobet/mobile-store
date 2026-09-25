import { QueryClient, isServer } from "@tanstack/react-query";

/**
 * `staleTime` is what stops a hydrated query from immediately refetching in
 * the browser: the catalog is prefetched at build time, so without it every
 * page would fire a duplicate request on mount and undo the point of the
 * prefetch. A minute is comfortably longer than a page visit, and a real-time
 * search still bypasses it because a new `search` value is a different key.
 */
const STALE_TIME_MS = 60_000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        // Retrying is the transport's job, not the cache's: src/lib/api/api.ts
        // already retries 5xx/dropped requests with a backoff tuned to the
        // free-tier cold starts. Retrying again here would multiply those
        // attempts and leave a genuinely broken search spinning for ~10s.
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client per server render (so concurrent renders never share a cache),
 * one long-lived client in the browser (so the cache survives navigation —
 * which is what makes listing -> detail -> back instant).
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
