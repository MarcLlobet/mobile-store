import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TilePendingHint } from "./TilePendingHint";

const { useLinkStatus } = vi.hoisted(() => ({ useLinkStatus: vi.fn() }));

vi.mock("next/link", () => ({ useLinkStatus }));

describe("TilePendingHint", () => {
  it("renders nothing while the navigation has not started", () => {
    useLinkStatus.mockReturnValue({ pending: false });

    const { container } = render(<TilePendingHint />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the hint once a navigation is pending", () => {
    useLinkStatus.mockReturnValue({ pending: true });

    const { container } = render(<TilePendingHint />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it("stays out of the accessibility tree, since the link already announces itself", () => {
    useLinkStatus.mockReturnValue({ pending: true });

    const { container } = render(<TilePendingHint />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("carries no text, so it cannot disturb the card's content", () => {
    useLinkStatus.mockReturnValue({ pending: true });

    const { container } = render(<TilePendingHint />);

    expect(container).toHaveTextContent("");
  });
});
