import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

/*
 * This suite drives the debounce on fake timers, so it uses `fireEvent.change` on
 * purpose: `userEvent` types one character at a time, which restarts the debounce
 * on each keystroke and would measure something other than the delay under test.
 */
/* eslint-disable testing-library/prefer-user-event */
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
    fireEvent.change(input, { target: { value: "  iPhone  " } });

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
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "iphone" } });

      const clear = screen.getByRole("button", { name: "Clear search" });
      expect(clear.querySelector("img")).toHaveAttribute("src", "/icons/figma/close.svg");
    });

    it("empties the field and reports the cleared query", () => {
      const onSearch = vi.fn();
      render(<SearchBar onSearch={onSearch} debounceMs={300} />);
      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "iphone" } });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      onSearch.mockClear();

      fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
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
      fireEvent.change(input, { target: { value: "iphone" } });

      fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

      expect(input).toHaveFocus();
    });
  });

  it("only fires once for rapid successive keystrokes", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "a" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(input, { target: { value: "ap" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(input, { target: { value: "app" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("app");
  });
});
