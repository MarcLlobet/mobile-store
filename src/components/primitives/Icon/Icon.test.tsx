import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, type IconName } from "./Icon";

const names: IconName[] = [
  "home",
  "cart",
  "back",
  "trash",
  "chevron-left",
  "chevron-right",
  "search",
];

describe("Icon", () => {
  it.each(names)("renders an svg for name=%s", (name) => {
    const { container } = render(<Icon name={name} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("is aria-hidden by default (decorative)", () => {
    const { container } = render(<Icon name="home" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an accessible role and title when ariaHidden is false", () => {
    render(<Icon name="search" ariaHidden={false} title="Search" />);
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument();
  });

  it("applies the size prop to width/height", () => {
    const { container } = render(<Icon name="home" size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
