import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("exposes an accessible, labelled search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("searchbox", { name: /search phones/i })).toBeInTheDocument();
  });

  it("does not call onSearch on mount", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("reports every keystroke, leaving the pacing to the caller", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("searchbox"), "abc");

    expect(onSearch).toHaveBeenCalledTimes(3);
    expect(onSearch).toHaveBeenLastCalledWith("abc");
  });

  describe("clear control", () => {
    it("is absent while the field is empty", () => {
      render(<SearchBar onSearch={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });

    it("appears once there is text, carrying the Figma cross rather than the browser's", async () => {
      render(<SearchBar onSearch={vi.fn()} />);
      await userEvent.type(screen.getByRole("searchbox"), "iphone");

      const clear = screen.getByRole("button", { name: "Clear search" });
      expect(clear.querySelector("img")?.getAttribute("src")).toMatch(/\/icons\/figma\/close\./);
    });

    it("empties the field and reports the cleared query", async () => {
      const onSearch = vi.fn();
      render(<SearchBar onSearch={onSearch} />);
      const input = screen.getByRole("searchbox");
      await userEvent.type(input, "iphone");
      onSearch.mockClear();

      await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

      expect(input).toHaveValue("");
      expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });

    it("leaves the caret in the field so the next query can be typed straight away", async () => {
      render(<SearchBar onSearch={vi.fn()} />);
      const input = screen.getByRole("searchbox");
      await userEvent.type(input, "iphone");

      await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

      expect(input).toHaveFocus();
    });
  });
});
