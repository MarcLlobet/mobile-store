import { QueryClient, environmentManager } from "@tanstack/react-query";

const STALE_TIME_MS = 60_000;

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * One client per browser tab, but a fresh one per server render so no request
 * ever sees another request's cache. Module scope is the only place this can
 * live, so the mutable slot is deliberate and confined to this file.
 */
// eslint-disable-next-line functional/no-let -- browser-singleton cache, see above
let browserQueryClient: QueryClient | undefined;

export const getQueryClient = (): QueryClient => {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
