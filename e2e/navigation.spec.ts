import { expect, test } from "@playwright/test";

/**
 * The Vitest suite mocks `next/navigation` everywhere, and its integration test
 * swaps screens with `useState`. Nothing there exercises the App Router, so this
 * is the only place the real journey is checked.
 */
test.describe("moving through the app", () => {
  test("walks listing -> detail -> cart and back, keeping the cart", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    await expect(page.getByText("Galaxy S24 Ultra")).toBeVisible();

    await page
      .getByRole("link", { name: /Galaxy S24 Ultra/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/phones\/SMG-S24U\//);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Galaxy S24 Ultra/i);

    // Both choices are required before the phone can be added. Picked through the
    // labelled radiogroups, which is also a check that those labels exist.
    await page
      .getByRole("radiogroup", { name: /STORAGE/i })
      .getByRole("radio")
      .first()
      .click();
    await page.getByRole("radiogroup", { name: /COLOR/i }).getByRole("radio").first().click();

    // Anchored: the label is "Add", and CSS uppercases it for display only.
    const addToCart = page.getByRole("button", { name: /^add$/i });
    await expect(addToCart).toBeEnabled();
    await addToCart.click();

    await page.getByRole("link", { name: /Cart/i }).click();
    await expect(page).toHaveURL(/\/cart\//);
    await expect(page.getByText("Galaxy S24 Ultra")).toBeVisible();

    // A real reload, so this proves the cart survives in storage rather than state.
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText("Galaxy S24 Ultra")).toBeVisible();
  });

  test("keeps the header mounted across a navigation instead of rebuilding it", async ({
    page,
  }) => {
    await page.goto("", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.__header = document.querySelector("header");
    });

    await page
      .getByRole("link", { name: /Galaxy S24 Ultra/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/phones\//);

    const sameNode = await page.evaluate(
      () => window.__header === document.querySelector("header"),
    );
    expect(sameNode, "the header should be the very same DOM node").toBe(true);
  });

  test("returns to the listing from the detail page", async ({ page }) => {
    await page.goto("phones/SMG-S24U/", { waitUntil: "networkidle" });

    await page.getByRole("link", { name: /back/i }).click();

    await expect(page).toHaveURL(/\/mobile-store\/$/);
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("searches without going back to the network", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    const apiCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/products")) {
        apiCalls.push(request.url());
      }
    });

    await page.getByRole("searchbox").fill("realme");

    await expect(page.getByText("Note 50")).toBeVisible();
    expect(apiCalls, "search should be a local tree lookup").toEqual([]);
  });
});
