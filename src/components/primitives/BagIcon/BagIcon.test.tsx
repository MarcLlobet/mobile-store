import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BagIcon } from "./BagIcon";

const svgOf = (container: HTMLElement) => container.querySelector("svg");

describe("BagIcon", () => {
  it("reports the empty state so the fill stays below the bag", () => {
    const { container } = render(<BagIcon filled={false} />);
    expect(svgOf(container)).toHaveAttribute("data-filled", "false");
  });

  it("reports the filled state, which is what raises the fill", () => {
    const { container } = render(<BagIcon filled />);
    expect(svgOf(container)).toHaveAttribute("data-filled", "true");
  });

  it("holds both states at once, so one can be wiped over the other", () => {
    const { container } = render(<BagIcon filled={false} />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelectorAll("mask")).toHaveLength(2);
  });

  it("gives each instance its own mask ids, so two bags cannot collide", () => {
    const { container } = render(
      <>
        <BagIcon filled={false} />
        <BagIcon filled />
      </>,
    );
    const ids = [...container.querySelectorAll("mask")].map((mask) => mask.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the mask ids usable inside a url() reference", () => {
    const { container } = render(<BagIcon filled={false} />);
    const ids = [...container.querySelectorAll("mask")].map((mask) => mask.id);

    expect(ids.every((id) => /^[\w-]+$/u.test(id))).toBe(true);
  });

  it("is decorative, so the header link supplies the accessible name", () => {
    const { container } = render(<BagIcon filled />);
    expect(svgOf(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the size to both axes", () => {
    const { container } = render(<BagIcon filled={false} size={48} />);
    expect(svgOf(container)).toHaveAttribute("width", "48");
    expect(svgOf(container)).toHaveAttribute("height", "48");
  });
});
