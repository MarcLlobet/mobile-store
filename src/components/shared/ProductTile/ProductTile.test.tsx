import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductTile } from "./ProductTile";
import { VIEWPORT_PREFETCH_DELAY_MS } from "./useViewportPrefetch";

type MockLinkProps = ComponentProps<"a"> & { readonly prefetch?: boolean | "auto" | null };

const {
  prefetch,
  observe,
  disconnect,
  intersect,
  callbacks: observers,
} = vi.hoisted(() => {
  const callbacks = new Set<IntersectionObserverCallback>();
  return {
    prefetch: vi.fn(),
    observe: vi.fn(),
    disconnect: vi.fn(),
    intersect: (isIntersecting: boolean) => {
      callbacks.forEach((callback) => {
        callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
      });
    },
    callbacks,
  };
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch }) }));

vi.mock("next/link", () => ({
  default: ({ children, prefetch, ...rest }: MockLinkProps) => (
    <a data-prefetch={String(prefetch)} {...rest}>
      {children}
    </a>
  ),
  useLinkStatus: () => ({ pending: false }),
}));

const product = {
  id: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  basePrice: 1319,
  imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
};

const noRecords = (): IntersectionObserverEntry[] => [];

const FakeIntersectionObserver = function (callback: IntersectionObserverCallback) {
  observers.add(callback);
  return {
    observe,
    disconnect,
    unobserve: vi.fn(),
    takeRecords: noRecords,
    root: null,
    rootMargin: "",
    thresholds: [],
  };
};

describe("ProductTile", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    prefetch.mockClear();
    observers.clear();
  });

  it("renders name, brand and image", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Apple iPhone 15 Pro Max");
  });

  it("renders the image url it is given", () => {
    render(<ProductTile {...product} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("https://prueba-tecnica-api-tienda-moviles.onrender.com"),
    );
  });

  it("renders the formatted base price", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByText("1319 EUR")).toBeInTheDocument();
  });

  it("links to /phones/[id]", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/phones/APL-IP15PM");
  });

  describe("prefetching the detail route", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("leaves Link's own prefetching off, because this component drives it", () => {
      render(<ProductTile {...product} />);

      expect(screen.getByRole("link")).toHaveAttribute("data-prefetch", "false");
    });

    it("prefetches nothing while the tile has not been seen", () => {
      render(<ProductTile {...product} />);

      expect(prefetch).not.toHaveBeenCalled();
    });

    it("prefetches nothing the instant the tile appears", () => {
      render(<ProductTile {...product} />);

      intersect(true);

      expect(prefetch).not.toHaveBeenCalled();
    });

    it("prefetches once the tile has stayed in view", () => {
      render(<ProductTile {...product} />);

      intersect(true);
      vi.advanceTimersByTime(VIEWPORT_PREFETCH_DELAY_MS);

      expect(prefetch).toHaveBeenCalledExactlyOnceWith("/phones/APL-IP15PM");
    });

    it("prefetches nothing for a tile scrolled past before it settles", () => {
      render(<ProductTile {...product} />);

      intersect(true);
      vi.advanceTimersByTime(VIEWPORT_PREFETCH_DELAY_MS / 2);
      intersect(false);
      vi.advanceTimersByTime(VIEWPORT_PREFETCH_DELAY_MS);

      expect(prefetch).not.toHaveBeenCalled();
    });
  });

  describe("the shared name that morphs into the detail hero", () => {
    it("stays off every tile until one is pointed at", () => {
      render(<ProductTile {...product} />);

      expect(screen.getByRole("img").parentElement).not.toHaveStyle({
        viewTransitionName: "product-image-APL-IP15PM",
      });
    });

    it("names only the tile being pointed at, so the rest keep fading as one page", async () => {
      render(<ProductTile {...product} />);
      const link = screen.getByRole("link");

      await userEvent.hover(link);

      expect(screen.getByRole("img").parentElement).toHaveStyle({
        viewTransitionName: "product-image-APL-IP15PM",
      });

      await userEvent.unhover(link);

      expect(screen.getByRole("img").parentElement).not.toHaveStyle({
        viewTransitionName: "product-image-APL-IP15PM",
      });
    });
  });
});
