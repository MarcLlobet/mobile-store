import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("render exploded");
  }
  return <p>all good</p>;
};

const fallback = (error: Error, reset: () => void) => (
  <div>
    <p>caught: {error.message}</p>
    <button type="button" onClick={reset}>
      retry
    </button>
  </div>
);

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders its children while nothing throws", () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("swaps to the fallback, handing it the error, when a child throws", () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("caught: render exploded")).toBeInTheDocument();
    expect(screen.queryByText("all good")).not.toBeInTheDocument();
  });

  it("reports the error to onError", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it("retries the children when the fallback resets it", async () => {
    const { rerender } = render(
      <ErrorBoundary fallback={fallback}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText("caught: render exploded")).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={fallback}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: "retry" }));

    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("only catches the subtree it wraps", () => {
    render(
      <div>
        <ErrorBoundary fallback={fallback}>
          <Boom shouldThrow />
        </ErrorBoundary>
        <p>sibling survives</p>
      </div>,
    );

    expect(screen.getByText("caught: render exploded")).toBeInTheDocument();
    expect(screen.getByText("sibling survives")).toBeInTheDocument();
  });
});
