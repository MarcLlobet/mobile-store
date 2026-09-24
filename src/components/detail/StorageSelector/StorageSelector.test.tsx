import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StorageSelector } from "./StorageSelector";

const options = [
  { capacity: "256GB", price: 1319 },
  { capacity: "512GB", price: 1449 },
  { capacity: "1TB", price: 1699 },
];

describe("StorageSelector", () => {
  it("renders a radio group with one radio per storage option", () => {
    render(<StorageSelector options={options} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Storage" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("shows each option's own absolute price, not basePrice + delta", () => {
    render(<StorageSelector options={options} selected={null} onSelect={vi.fn()} />);
    const eur = (value: number) => `${Math.round(value)} EUR`;
    expect(screen.getByText(eur(1319))).toBeInTheDocument();
    expect(screen.getByText(eur(1449))).toBeInTheDocument();
    expect(screen.getByText(eur(1699))).toBeInTheDocument();
  });

  it("marks the matching option as checked", () => {
    render(<StorageSelector options={options} selected={options[1] ?? null} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("radio")[1]).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByRole("radio")[0]).toHaveAttribute("aria-checked", "false");
  });

  it("calls onSelect with the clicked option", async () => {
    const onSelect = vi.fn();
    render(<StorageSelector options={options} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getAllByRole("radio")[2]!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(options[2]);
  });
});
