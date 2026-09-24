import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhoneHero } from "./PhoneHero";

describe("PhoneHero", () => {
  it("renders the image with the phone name as alt text", () => {
    render(
      <PhoneHero
        imageUrl="https://prueba-tecnica-api-tienda-moviles.onrender.com/images/black.png"
        name="iPhone 15 Pro Max"
      />,
    );
    const img = screen.getByRole("img", { name: "iPhone 15 Pro Max" });
    expect(img).toHaveAttribute(
      "src",
      "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/black.png",
    );
  });

  it("swaps the image src when the imageUrl prop changes", () => {
    const { rerender } = render(
      <PhoneHero imageUrl="https://example.com/black.png" name="Phone" />,
    );
    expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute(
      "src",
      "https://example.com/black.png",
    );

    rerender(<PhoneHero imageUrl="https://example.com/blue.png" name="Phone" />);
    expect(screen.getByRole("img", { name: "Phone" })).toHaveAttribute(
      "src",
      "https://example.com/blue.png",
    );
  });
});
