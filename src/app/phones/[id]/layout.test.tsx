import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhoneDetailLayout from "./layout";

describe("PhoneDetailLayout", () => {
  it("provides the single main landmark and the back-to-listing link for the segment", () => {
    render(
      <PhoneDetailLayout>
        <p>Phone body</p>
      </PhoneDetailLayout>,
    );

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Back to listing" })).toHaveAttribute("href", "/");
    // The page body renders inside that landmark, so page/loading/not-found
    // must not add a <main> of their own.
    expect(screen.getByRole("main")).toContainElement(screen.getByText("Phone body"));
  });
});
