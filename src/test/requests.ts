import { afterEach, beforeEach } from "vitest";
import { server } from "@mocks/server";

/**
 * Records every request MSW intercepts for the current test.
 *
 * Lets a test assert on the *absence* of a request — "the hydrated cache was
 * used, nothing was re-fetched on mount" — which is the whole point of the
 * build-time prefetch and cannot be checked by looking at the rendered output.
 */
export function trackRequests(): { urls: () => string[] } {
  const urls: string[] = [];

  function record({ request }: { request: Request }) {
    urls.push(request.url);
  }

  beforeEach(() => {
    urls.length = 0;
    server.events.on("request:start", record);
  });

  afterEach(() => {
    server.events.removeListener("request:start", record);
  });

  return { urls: () => [...urls] };
}
