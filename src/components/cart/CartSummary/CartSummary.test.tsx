import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CartSummary } from "./CartSummary";

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

describe("CartSummary", () => {
  it("renders the formatted total price associated with 'Total'", () => {
    render(<CartSummary totalPrice={2818} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("2818 EUR")).toBeInTheDocument();
  });

  it("navigates to / when Continue shopping is clicked", async () => {
    render(<CartSummary totalPrice={100} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue shopping" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
