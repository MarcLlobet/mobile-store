import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorSelector } from "./ColorSelector";

const colors = [
  { name: "Black", hexCode: "#000000", imageUrl: "https://example.com/black.png" },
  { name: "Blue", hexCode: "#0000ff", imageUrl: "https://example.com/blue.png" },
];

describe("ColorSelector", () => {
  it("renders a radio group with one radio per color", () => {
    render(<ColorSelector colors={colors} selected={null} onSelect={vi.fn()} />);
    expect(
      screen.getByRole("radiogroup", { name: "COLOR. PICK YOUR FAVOURITE." }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks nothing as checked when selected is null", () => {
    render(<ColorSelector colors={colors} selected={null} onSelect={vi.fn()} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
  });

  it("marks the matching swatch as checked", () => {
    render(<ColorSelector colors={colors} selected={colors[1] ?? null} onSelect={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "Blue" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Black" })).toHaveAttribute("aria-checked", "false");
  });

  it("calls onSelect with the clicked color", async () => {
    const onSelect = vi.fn();
    render(<ColorSelector colors={colors} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("radio", { name: "Black" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(colors[0]);
  });

  it("renders the selected color's name as visible text below the swatch row", () => {
    render(<ColorSelector colors={colors} selected={colors[1] ?? null} onSelect={vi.fn()} />);
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("renders no name text when nothing is selected", () => {
    render(<ColorSelector colors={colors} selected={null} onSelect={vi.fn()} />);
    expect(screen.queryByText("Black")).not.toBeInTheDocument();
    expect(screen.queryByText("Blue")).not.toBeInTheDocument();
  });
});
