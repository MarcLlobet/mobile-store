import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ICON_NAMES, Icon } from "./Icon";

describe("Icon", () => {
  it.each(ICON_NAMES)("renders a real Figma image asset for name=%s", (name) => {
    const { container } = render(<Icon name={name} />);
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("is aria-hidden by default (decorative)", () => {
    const { container } = render(<Icon name="close" />);
    expect(container.querySelector("img")).toHaveAttribute("aria-hidden", "true");
  });

  it("leaves the alt empty while it is decorative, so it is skipped by screen readers", () => {
    const { container } = render(<Icon name="close" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("exposes an accessible name via alt text when ariaHidden is false", () => {
    render(<Icon name="logo" ariaHidden={false} title="Mobile Store" />);
    expect(screen.getByRole("img", { name: "Mobile Store" })).toBeInTheDocument();
  });

  it("falls back to the icon name when no title is given", () => {
    render(<Icon name="back" ariaHidden={false} />);
    expect(screen.getByRole("img", { name: "back" })).toBeInTheDocument();
  });

  it("applies the size prop to a square icon", () => {
    const { container } = render(<Icon name="close" size={32} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "32");
    expect(img).toHaveAttribute("height", "32");
  });

  it("preserves aspect ratio for non-square asset icons", () => {
    const { container } = render(<Icon name="logo" size={77} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "77");
    expect(img).toHaveAttribute("height", "29");
  });
});
