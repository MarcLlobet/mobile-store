import type { ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductTile } from "./ProductTile";

/*
 * `next/link` swallows `prefetch` rather than reflecting it in the DOM, so the
 * real component gives a test nothing to assert on. Standing in for it exposes
 * the prop this component is responsible for choosing; that prefetching then
 * actually happens over the wire is checked against a production build instead.
 */
type MockLinkProps = ComponentProps<"a"> & { readonly prefetch?: boolean | "auto" | null };

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

describe("ProductTile", () => {
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
    it("holds prefetching back until the visitor shows intent", () => {
      render(<ProductTile {...product} />);

      expect(screen.getByRole("link")).toHaveAttribute("data-prefetch", "false");
    });

    const intentSignals: readonly (readonly [string, (link: HTMLElement) => Promise<void>])[] = [
      [
        "the pointer enters it",
        async (link) => {
          await userEvent.hover(link);
        },
      ],
      [
        "it takes keyboard focus",
        (link) => {
          fireEvent.focus(link);
          return Promise.resolve();
        },
      ],
      [
        "a touch lands on it",
        (link) => {
          fireEvent.touchStart(link);
          return Promise.resolve();
        },
      ],
    ];

    it.each(intentSignals)("starts prefetching once %s", async (_case, trigger) => {
      render(<ProductTile {...product} />);
      const link = screen.getByRole("link");

      await trigger(link);

      // `null` restores Link's default, which for a static route is a full prefetch.
      expect(link).toHaveAttribute("data-prefetch", "null");
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
