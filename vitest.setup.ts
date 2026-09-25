import "@testing-library/jest-dom/vitest";
import React from "react";

import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "@mocks/server";

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

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
