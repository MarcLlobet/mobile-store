import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackButton } from "./BackButton";

const { back } = vi.hoisted(() => ({ back: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ back }) }));

const link = () => screen.getByRole("link", { name: "Back to listing" });

describe("BackButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    back.mockClear();
  });

  it("links to the listing by default", () => {
    render(<BackButton />);
    expect(link()).toHaveAttribute("href", "/");
  });

  it("supports a custom destination", () => {
    render(<BackButton href="/phones/APL-I15PM" />);
    expect(link()).toHaveAttribute("href", "/phones/APL-I15PM");
  });

  it("follows the href when the visitor landed here directly, since nothing precedes it", async () => {
    vi.stubGlobal("navigation", { canGoBack: false });
    render(<BackButton />);

    await userEvent.click(link());

    expect(back).not.toHaveBeenCalled();
  });

  it("follows the href where the browser has no Navigation API to ask", async () => {
    expect(globalThis.navigation).toBeUndefined();
    render(<BackButton />);

    await userEvent.click(link());

    expect(back).not.toHaveBeenCalled();
  });

  it("returns to the previous page once there is one to return to", async () => {
    vi.stubGlobal("navigation", { canGoBack: true });
    render(<BackButton />);

    await userEvent.click(link());

    expect(back).toHaveBeenCalledOnce();
  });

  it("leaves a modifier-click alone, so opening in a new tab still works", async () => {
    vi.stubGlobal("navigation", { canGoBack: true });
    render(<BackButton />);

    const user = userEvent.setup();
    await user.keyboard("{Meta>}");
    await user.click(link());
    await user.keyboard("{/Meta}");

    expect(back).not.toHaveBeenCalled();
  });
});
