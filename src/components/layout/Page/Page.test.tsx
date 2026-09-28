import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Page } from "./Page";

describe("Page", () => {
  it("is the page's main landmark, so every route gets one without saying so", () => {
    render(<Page>content</Page>);
    expect(screen.getByRole("main")).toHaveTextContent("content");
  });

  it("spans the full width by default", () => {
    render(<Page>content</Page>);
    expect(screen.getByRole("main")).toHaveAttribute("data-width", "wide");
  });

  it("can hold its content in a centred column instead", () => {
    render(<Page width="column">content</Page>);
    expect(screen.getByRole("main")).toHaveAttribute("data-width", "column");
  });

  it("puts the lead outside that column, which is why it is a slot and not a child", () => {
    render(
      <Page width="column" lead={<span>Back</span>}>
        <p>content</p>
      </Page>,
    );
    const lead = screen.getByText("Back");
    const content = screen.getByText("content");

    expect(lead.parentElement).not.toBe(content.parentElement);
  });

  it("renders no lead wrapper when there is nothing to lead with", () => {
    render(<Page>content</Page>);
    expect(screen.getByRole("main").children).toHaveLength(0);
  });

  it("takes a class for whatever is particular to one route", () => {
    render(<Page className="cart">content</Page>);
    expect(screen.getByRole("main")).toHaveClass("cart");
  });

  it("can announce itself as busy while a route loads", () => {
    render(
      <Page ariaBusy ariaLabel="Loading the catalog">
        content
      </Page>,
    );
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("main")).toHaveAccessibleName("Loading the catalog");
  });

  it("can become the alert a failed route needs", () => {
    render(<Page role="alert">Something went wrong</Page>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
