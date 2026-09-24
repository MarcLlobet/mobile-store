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
