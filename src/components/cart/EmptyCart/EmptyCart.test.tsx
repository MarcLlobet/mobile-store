import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyCart } from "./EmptyCart";

// The global `next/navigation` mock in vitest.setup.ts returns a plain
// object (not a vi.fn()), so it can't be overridden per-test via
// `vi.mocked(useRouter).mockReturnValue(...)`. This local override — hoisted
// so the mock factory can reference it — gives this file its own spy-able
// `push`.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("EmptyCart", () => {
  it("renders an empty-cart message", () => {
    render(<EmptyCart />);
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("navigates to / when Continue shopping is clicked", async () => {
    render(<EmptyCart />);
    await userEvent.click(screen.getByRole("button", { name: "Continue shopping" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
