import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button variant="primary">Add to cart</Button>);
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Click me
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Click me" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" disabled onClick={onClick}>
        Click me
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports an explicit ariaLabel distinct from visible children", () => {
    render(
      <Button variant="standard" ariaLabel="Remove item">
        <span aria-hidden="true">x</span>
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Remove item" })).toBeInTheDocument();
  });

  it("defaults to type=button so it never accidentally submits a form", () => {
    render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });
});
