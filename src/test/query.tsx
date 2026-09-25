import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Test-time React Query setup.
 *
 * A fresh client per test, so one test's cache can never leak into the next.
 * `retry: false` matches the app's own default (src/lib/query/queryClient.ts —
 * retries belong to the transport), which also keeps a failing-request test
 * from waiting out a backoff. `staleTime` matches the app so seeded data
 * behaves exactly as hydrated data does in production: read from cache, no
 * refetch on mount.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export interface RenderWithQueryOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  /** Extra providers to nest inside the QueryClientProvider (e.g. CartProvider). */
  wrap?: (children: ReactNode) => ReactElement;
}

export interface RenderWithQueryResult extends RenderResult {
  queryClient: QueryClient;
}

export function renderWithQuery(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), wrap, ...options }: RenderWithQueryOptions = {},
): RenderWithQueryResult {
  const result = render(
    <QueryClientProvider client={queryClient}>{wrap ? wrap(ui) : ui}</QueryClientProvider>,
    options,
  );
  return { ...result, queryClient };
}
