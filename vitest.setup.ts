import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

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
