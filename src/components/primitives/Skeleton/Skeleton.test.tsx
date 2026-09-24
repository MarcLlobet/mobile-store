import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a decorative placeholder by default", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes a status role and label when ariaLabel is provided", () => {
    render(<Skeleton ariaLabel="Loading phone details" />);
    expect(screen.getByRole("status", { name: "Loading phone details" })).toBeInTheDocument();
  });

  it("applies width/height as inline styles", () => {
    const { container } = render(<Skeleton width={120} height={40} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("40px");
  });
});
