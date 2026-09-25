import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PhoneHero } from "./PhoneHero";

const BLACK = "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/black.png";
const BLUE = "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/blue.png";

const variants = [
  { key: "Black", imageUrl: BLACK },
  { key: "Blue", imageUrl: BLUE },
];

/** Installs a stub `HTMLImageElement.decode`, which jsdom does not implement. */
const stubDecode = () => {
  const decode = vi.fn(() => Promise.resolve());
  (HTMLImageElement.prototype as { decode?: unknown }).decode = decode;
  return decode;
};

describe("PhoneHero", () => {
  it("names only the active variant with the phone name", () => {
    render(<PhoneHero variants={variants} activeKey="Black" name="iPhone 15 Pro Max" />);
    const img = screen.getByRole("img", { name: "iPhone 15 Pro Max" });
    expect(img).toHaveAttribute("src", BLACK);
  });

  it("renders every variant up front, eagerly, so none is fetched on selection", () => {
    const { container } = render(<PhoneHero variants={variants} activeKey="Black" name="Phone" />);
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([BLACK, BLUE]);
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("loading", "eager");
    });
    expect(imgs[0]).toHaveAttribute("fetchpriority", "high");
    expect(imgs[1]).toHaveAttribute("fetchpriority", "low");
  });

  it("hides the inactive variants from assistive tech", () => {
    const { container } = render(<PhoneHero variants={variants} activeKey="Black" name="Phone" />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(container.querySelectorAll('img[aria-hidden="true"]')).toHaveLength(1);
  });

  it("reveals the already-rendered variant when the active key changes", () => {
    const { container, rerender } = render(
      <PhoneHero variants={variants} activeKey="Black" name="Phone" />,
    );
    const before = [...container.querySelectorAll("img")];

    rerender(<PhoneHero variants={variants} activeKey="Blue" name="Phone" />);

    expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute("src", BLUE);
    expect([...container.querySelectorAll("img")]).toEqual(before);
  });

  it("keeps two colors that share one photo as two addressable variants", () => {
    const shared = [
      { key: "Graphite", imageUrl: BLACK },
      { key: "Space Black", imageUrl: BLACK },
    ];
    const { container } = render(
      <PhoneHero variants={shared} activeKey="Space Black" name="Phone" />,
    );

    const imgs = [...container.querySelectorAll("img")];
    expect(imgs).toHaveLength(2);
    expect(imgs[1]).toHaveAttribute("alt", "Phone");
    expect(imgs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("falls back to the first variant when the active key is unknown", () => {
    render(<PhoneHero variants={variants} activeKey="Nonexistent" name="Phone" />);
    expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute("src", BLACK);
  });

  describe("pre-decoding", () => {
    afterEach(() => {
      delete (HTMLImageElement.prototype as { decode?: unknown }).decode;
    });

    it("pre-decodes every variant, not just the visible one", () => {
      const decode = stubDecode();
      render(<PhoneHero variants={variants} activeKey="Black" name="Phone" />);
      expect(decode).toHaveBeenCalledTimes(variants.length);
    });

    it("does not re-decode when only the active variant changes", () => {
      const decode = stubDecode();
      const { rerender } = render(<PhoneHero variants={variants} activeKey="Black" name="Phone" />);
      decode.mockClear();

      rerender(<PhoneHero variants={variants} activeKey="Blue" name="Phone" />);

      expect(decode).not.toHaveBeenCalled();
    });

    it("survives a browser without decode(), and a rejected decode", async () => {
      const decode = vi.fn(() => Promise.reject(new Error("EncodingError")));
      (HTMLImageElement.prototype as { decode?: unknown }).decode = decode;

      render(<PhoneHero variants={variants} activeKey="Black" name="Phone" />);
      await Promise.resolve();

      expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute("src", BLACK);
    });
  });

  it("renders nothing when there are no variants", () => {
    const { container } = render(<PhoneHero variants={[]} activeKey="" name="Phone" />);
    expect(container).toBeEmptyDOMElement();
  });
});
