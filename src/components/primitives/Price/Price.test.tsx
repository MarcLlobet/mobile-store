import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Price } from "./Price";

describe("Price", () => {
  it("formats a value as a rounded EUR amount by default", () => {
    render(<Price value={1319} />);
    expect(screen.getByText("1319 EUR")).toBeInTheDocument();
  });

  it("honors an explicit currency", () => {
    render(<Price value={999} currency="USD" />);
    expect(screen.getByText("999 USD")).toBeInTheDocument();
  });

  it("rounds fractional values", () => {
    render(<Price value={999.5} />);
    expect(screen.getByText("1000 EUR")).toBeInTheDocument();
  });
});
