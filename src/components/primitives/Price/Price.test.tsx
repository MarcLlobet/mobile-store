import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Price } from "./Price";

describe("Price", () => {
  it("formats a value as EUR currency by default", () => {
    render(<Price value={1319} />);
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(
      1319,
    );
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it("honors an explicit currency", () => {
    render(<Price value={999} currency="USD" />);
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      999,
    );
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });
});
