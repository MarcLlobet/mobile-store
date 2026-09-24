import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectorsPanel } from "./SelectorsPanel";

const colors = [{ name: "Black", hexCode: "#000000", imageUrl: "https://example.com/black.png" }];
const storageOptions = [{ capacity: "256GB", price: 1319 }];

describe("SelectorsPanel", () => {
  it("renders both a color and a storage radiogroup", () => {
    render(
      <SelectorsPanel
        colors={colors}
        selectedColor={null}
        onSelectColor={vi.fn()}
        storageOptions={storageOptions}
        selectedStorage={null}
        onSelectStorage={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "COLOR. PICK YOUR FAVOURITE." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "STORAGE. HOW MUCH SPACE DO YOU NEED?" }),
    ).toBeInTheDocument();
  });

  it("forwards color selection to onSelectColor", async () => {
    const onSelectColor = vi.fn();
    render(
      <SelectorsPanel
        colors={colors}
        selectedColor={null}
        onSelectColor={onSelectColor}
        storageOptions={storageOptions}
        selectedStorage={null}
        onSelectStorage={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Black" }));
    expect(onSelectColor).toHaveBeenCalledWith(colors[0]);
  });

  it("forwards storage selection to onSelectStorage", async () => {
    const onSelectStorage = vi.fn();
    render(
      <SelectorsPanel
        colors={colors}
        selectedColor={null}
        onSelectColor={vi.fn()}
        storageOptions={storageOptions}
        selectedStorage={null}
        onSelectStorage={onSelectStorage}
      />,
    );
    await userEvent.click(screen.getAllByRole("radio", { name: /256GB/ })[0]!);
    expect(onSelectStorage).toHaveBeenCalledWith(storageOptions[0]);
  });
});
