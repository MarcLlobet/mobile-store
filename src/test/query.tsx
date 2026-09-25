import type { ReactElement, ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });

/* Both extend Testing Library types, which are mutable and not ours to change.
   Every field declared here is readonly; the exemptions cover only what RTL adds. */
// eslint-disable-next-line functional/type-declaration-immutability
export interface RenderWithQueryOptions extends Omit<RenderOptions, "wrapper"> {
  readonly queryClient?: QueryClient;
  readonly wrap?: (children: ReactNode) => ReactElement;
}

// eslint-disable-next-line functional/type-declaration-immutability
export interface RenderWithQueryResult extends RenderResult {
  readonly queryClient: QueryClient;
}

export const renderWithQuery = (
  ui: ReactElement,
  { queryClient = createTestQueryClient(), wrap, ...options }: RenderWithQueryOptions = {},
): RenderWithQueryResult => {
  const view = render(
    <QueryClientProvider client={queryClient}>{wrap ? wrap(ui) : ui}</QueryClientProvider>,
    options,
  );
  return { ...view, queryClient };
};
