import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultsCount } from "./ResultsCount";

describe("ResultsCount", () => {
  it("announces plural results", () => {
    render(<ResultsCount count={24} />);
    expect(screen.getByText("24 results")).toBeInTheDocument();
  });

  it("announces a single result in singular form", () => {
    render(<ResultsCount count={1} />);
    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("announces zero results distinctly", () => {
    render(<ResultsCount count={0} />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("shows a searching state while loading, regardless of the last known count", () => {
    render(<ResultsCount count={3} isLoading />);
    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });

  it("is exposed as a polite live region so updates are announced", () => {
    render(<ResultsCount count={5} />);
    const status = screen.getByText("5 results");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("role", "status");
  });
});
