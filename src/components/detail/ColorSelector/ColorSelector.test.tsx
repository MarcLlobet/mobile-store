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

  it("keeps the name label's line box when nothing is selected, so selecting can't shift the layout", () => {
    const { container } = render(
      <ColorSelector colors={colors} selected={null} onSelect={vi.fn()} />,
    );

    // The label always renders a name — the first color's, as a stand-in — so
    // the box has a real line height from the first paint. It is CSS
    // (`visibility: hidden` while no swatch is aria-checked) that keeps it out
    // of sight and out of the accessibility tree; jsdom applies no stylesheet,
    // hence the structural assertion rather than a visibility one.
    const label = container.querySelector("p");
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent("Black");
    expect(
      screen.getAllByRole("radio").every((radio) => radio.getAttribute("aria-checked") === "false"),
    ).toBe(true);
  });

  it("swaps the label to the selected color once there is one", () => {
    const { container } = render(
      <ColorSelector colors={colors} selected={colors[1]} onSelect={vi.fn()} />,
    );
    expect(container.querySelector("p")).toHaveTextContent("Blue");
  });

  describe("CSS hover-preview contract", () => {
    // The preview itself is a `:has()` rule in PhoneDetailView.module.css, so
    // jsdom cannot exercise it. What IS testable — and what would actually
    // break it — is the positional hook those rules match on.
    it("indexes each swatch positionally so the hero image can be paired with it", () => {
      render(<ColorSelector colors={colors} selected={colors[0]} onSelect={vi.fn()} />);

      const indexes = screen
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("data-color-index"));
      expect(indexes).toEqual(["0", "1"]);
    });

    it("names every swatch on hover via title, without any hover handler", () => {
      render(<ColorSelector colors={colors} selected={colors[0]} onSelect={vi.fn()} />);
      expect(screen.getByRole("radio", { name: "Blue" })).toHaveAttribute("title", "Blue");
    });
  });
});
