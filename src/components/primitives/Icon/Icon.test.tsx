import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon, type IconName } from "./Icon";

const svgNames: IconName[] = ["home", "trash", "chevron-left", "chevron-right", "search"];
const assetNames: IconName[] = ["back", "bag-empty", "bag-filled", "logo"];

describe("Icon", () => {
  it.each(svgNames)("renders an svg for name=%s", (name) => {
    const { container } = render(<Icon name={name} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it.each(assetNames)("renders a real Figma image asset for name=%s", (name) => {
    const { container } = render(<Icon name={name} />);
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("is aria-hidden by default (decorative)", () => {
    const { container } = render(<Icon name="home" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an accessible role and title when ariaHidden is false", () => {
    render(<Icon name="search" ariaHidden={false} title="Search" />);
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument();
  });

  it("exposes an accessible name via alt text for asset-backed icons when not hidden", () => {
    render(<Icon name="logo" ariaHidden={false} title="Mobile Store" />);
    expect(screen.getByRole("img", { name: "Mobile Store" })).toBeInTheDocument();
  });

  it("applies the size prop to width/height", () => {
    const { container } = render(<Icon name="home" size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("preserves aspect ratio for non-square asset icons", () => {
    const { container } = render(<Icon name="logo" size={77} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "77");
    expect(img).toHaveAttribute("height", "29");
  });
});
