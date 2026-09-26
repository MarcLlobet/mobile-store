import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce, throttle } from "./schedule";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once, with the latest arguments, after the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced.run("a");
    debounced.run("ab");
    debounced.run("abc");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("restarts the delay on every call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced.run("a");
    vi.advanceTimersByTime(299);
    debounced.run("b");
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("drops a pending call when cancelled", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced.run("a");
    debounced.cancel();
    vi.advanceTimersByTime(1000);

    expect(fn).not.toHaveBeenCalled();
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs immediately on the first call", () => {
    const fn = vi.fn();
    throttle(fn, 100).run("first");

    expect(fn).toHaveBeenCalledExactlyOnceWith("first");
  });

  it("collapses a burst into one leading and one trailing call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.run("a");
    throttled.run("b");
    throttled.run("c");
    expect(fn).toHaveBeenCalledExactlyOnceWith("a");

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c");
  });

  it("runs again immediately once the interval has passed", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.run("a");
    vi.advanceTimersByTime(200);
    throttled.run("b");

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });

  it("drops a pending trailing call when cancelled", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled.run("a");
    throttled.run("b");
    throttled.cancel();
    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledExactlyOnceWith("a");
  });
});
