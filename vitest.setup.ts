import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@mocks/server";

// next/navigation is only usable inside the Next.js router tree at runtime;
// under Vitest there is no router, so components that call these hooks need
// a safe default. Individual tests can override these mocks with
// `vi.mocked(useRouter).mockReturnValue(...)` etc.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// next/image renders a plain <img> in tests — avoids pulling in the real
// Next.js image optimization pipeline (which is disabled anyway under
// output:'export', see next.config.ts) and keeps component tests simple.
vi.mock("next/image", () => ({
  __esModule: true,
  default: function NextImageMock({
    src,
    alt,
    ...rest
  }: { src: string; alt: string } & Record<string, unknown>) {
    return React.createElement("img", { src, alt, ...rest });
  },
}));

// Every test in the suite talks to the external catalog API through MSW,
// which serves the responses recorded in `mocks/` (see mocks/handlers.ts).
// `onUnhandledRequest: "error"` is deliberate: a request no handler covers
// fails the test instead of quietly escaping to the real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
