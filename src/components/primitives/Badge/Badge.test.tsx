import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders nothing at count 0", () => {
    const { container } = render(<Badge count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for negative counts", () => {
    const { container } = render(<Badge count={-1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the count when positive", () => {
    render(<Badge count={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
