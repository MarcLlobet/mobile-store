import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes an accessible, labelled search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("searchbox", { name: /search phones/i })).toBeInTheDocument();
  });

  it("does not call onSearch on mount", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch with the trimmed query once the debounce delay elapses", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);

    const input = screen.getByRole("searchbox");
    act(() => {
      fireEvent.change(input, { target: { value: "  iPhone  " } });
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("iPhone");
  });

  describe("clear control", () => {
    it("is absent while the field is empty", () => {
      render(<SearchBar onSearch={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });

    it("appears once there is text, carrying the Figma cross rather than the browser's", () => {
      render(<SearchBar onSearch={vi.fn()} />);
      act(() => {
        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "iphone" } });
      });

      const clear = screen.getByRole("button", { name: "Clear search" });
      // The native type="search" cancel button is a UA-drawn glyph with no
      // element of its own; this is a real button rendering the exported icon.
      expect(clear.querySelector("img")).toHaveAttribute("src", "/icons/figma/close.svg");
    });

    it("empties the field and reports the cleared query", () => {
      const onSearch = vi.fn();
      render(<SearchBar onSearch={onSearch} debounceMs={300} />);
      const input = screen.getByRole("searchbox");
      act(() => {
        fireEvent.change(input, { target: { value: "iphone" } });
        vi.advanceTimersByTime(300);
      });
      onSearch.mockClear();

      // Two passes: the click has to re-render with the emptied value before
      // the debounce timer for it exists to be advanced.
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(input).toHaveValue("");
      expect(onSearch).toHaveBeenCalledWith("");
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });

    it("leaves the caret in the field so the next query can be typed straight away", () => {
      render(<SearchBar onSearch={vi.fn()} />);
      const input = screen.getByRole("searchbox");
      act(() => {
        fireEvent.change(input, { target: { value: "iphone" } });
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
      });

      expect(input).toHaveFocus();
    });
  });

  it("only fires once for rapid successive keystrokes", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);

    const input = screen.getByRole("searchbox");
    act(() => {
      fireEvent.change(input, { target: { value: "a" } });
    });
    act(() => {
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: "ap" } });
    });
    act(() => {
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: "app" } });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("app");
  });
});
