import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * eslint-plugin-jsx-a11y already covers the static side at lint time. What it
 * cannot see is anything needing layout — colour contrast above all — because
 * the Vitest suite runs in jsdom, which computes none. That is what this adds.
 */
const audit = async (page: Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

const PAGES = [
  { name: "listing", path: "" },
  { name: "detail", path: "phones/SMG-S24U/" },
  { name: "cart", path: "cart/" },
  { name: "not found", path: "404.html" },
] as const;

test.describe("accessibility of the pages as built", () => {
  PAGES.forEach(({ name, path }) => {
    test(`${name} has no violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });

      const { violations } = await audit(page);

      expect(violations.map((violation) => violation.id)).toEqual([]);
    });
  });
});

/** Contrast lives in the states, not at rest — hover swaps the tile to black. */
test.describe("accessibility of the states", () => {
  test("a tile under the pointer stays readable", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    await page
      .getByRole("link", { name: /Galaxy S24 Ultra/i })
      .first()
      .hover();

    const { violations } = await audit(page);

    expect(violations.map((violation) => violation.id)).toEqual([]);
  });

  test("the empty search result stays readable", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    await page.getByRole("searchbox").fill("zzzz");
    await expect(page.getByText(/no phones match/i)).toBeVisible();

    const { violations } = await audit(page);

    expect(violations.map((violation) => violation.id)).toEqual([]);
  });

  test("a cart holding something stays readable", async ({ page }) => {
    await page.goto("phones/SMG-S24U/", { waitUntil: "networkidle" });
    await page
      .getByRole("radiogroup", { name: /STORAGE/i })
      .getByRole("radio")
      .first()
      .click();
    await page.getByRole("radiogroup", { name: /COLOR/i }).getByRole("radio").first().click();
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.getByRole("link", { name: /Cart/i }).click();
    await expect(page).toHaveURL(/\/cart\//);

    const { violations } = await audit(page);

    expect(violations.map((violation) => violation.id)).toEqual([]);
  });
});
