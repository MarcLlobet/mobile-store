import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders a generic message when no query is given", () => {
    render(<EmptyState />);
    expect(screen.getByText("No phones found.")).toBeInTheDocument();
  });

  it("mentions the search query when one produced zero results", () => {
    render(<EmptyState query="zzzz" />);
    expect(screen.getByText(/zzzz/)).toBeInTheDocument();
  });
});
