import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BackButton } from "./BackButton";

describe("BackButton", () => {
  it("links to the listing by default", () => {
    render(<BackButton />);
    expect(screen.getByRole("link", { name: "Back to listing" })).toHaveAttribute("href", "/");
  });

  it("supports a custom destination", () => {
    render(<BackButton href="/phones/APL-IP15PM" />);
    expect(screen.getByRole("link", { name: "Back to listing" })).toHaveAttribute(
      "href",
      "/phones/APL-IP15PM",
    );
  });
});
