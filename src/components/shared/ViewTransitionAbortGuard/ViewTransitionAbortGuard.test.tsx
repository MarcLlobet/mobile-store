import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ViewTransitionAbortGuard, isAbortedViewTransition } from "./ViewTransitionAbortGuard";

const abortedTransition = () =>
  new DOMException(
    "Transition was aborted because of invalid state. Document hidden",
    "InvalidStateError",
  );

describe("isAbortedViewTransition", () => {
  it("recognises the rejection the browser raises when it skips a hidden transition", () => {
    expect(isAbortedViewTransition(abortedTransition())).toBe(true);
  });

  it("leaves an unrelated InvalidStateError alone, so real bugs still surface", () => {
    const other = new DOMException("The database connection is closing", "InvalidStateError");

    expect(isAbortedViewTransition(other)).toBe(false);
  });

  it("leaves a plain error alone", () => {
    expect(isAbortedViewTransition(new Error("Transition failed"))).toBe(false);
  });

  it("survives a rejection carrying something that is not an error at all", () => {
    expect(isAbortedViewTransition("transition")).toBe(false);
    expect(isAbortedViewTransition(null)).toBe(false);
    expect(isAbortedViewTransition({ name: "InvalidStateError" })).toBe(false);
  });
});

describe("ViewTransitionAbortGuard", () => {
  it("renders nothing of its own", () => {
    const { container } = render(<ViewTransitionAbortGuard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stops listening once unmounted, so it cannot outlive the page", () => {
    const { unmount } = render(<ViewTransitionAbortGuard />);
    unmount();

    const event = new Event("unhandledrejection", { cancelable: true });
    Object.defineProperty(event, "reason", { value: abortedTransition() });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("swallows the aborted transition while mounted", () => {
    render(<ViewTransitionAbortGuard />);

    const event = new Event("unhandledrejection", { cancelable: true });
    Object.defineProperty(event, "reason", { value: abortedTransition() });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("lets an unrelated rejection through", () => {
    render(<ViewTransitionAbortGuard />);

    const event = new Event("unhandledrejection", { cancelable: true });
    Object.defineProperty(event, "reason", { value: new Error("boom") });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
