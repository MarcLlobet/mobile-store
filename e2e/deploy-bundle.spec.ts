import { expect, test } from "@playwright/test";

/**
 * The bundle CI uploads has `basePath: '/mobile-store'` baked into every asset
 * URL. A regression there breaks every page and no unit test, because none of
 * them ever loads a real asset.
 */
const PAGES = [
  { name: "listing", path: "", shows: /RESULTS/i },
  { name: "detail", path: "phones/SMG-S24U/", shows: /SPECIFICATIONS/i },
  { name: "cart", path: "cart/", shows: /Cart/i },
] as const;

test.describe("the deploy bundle", () => {
  PAGES.forEach(({ name, path, shows }) => {
    test(`serves ${name} with every asset resolving`, async ({ page }) => {
      const failed: string[] = [];
      const crashed: string[] = [];
      page.on("response", (response) => {
        if (response.status() >= 400) {
          failed.push(`${String(response.status())} ${response.url()}`);
        }
      });
      page.on("pageerror", (error) => crashed.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") {
          crashed.push(message.text());
        }
      });

      await page.goto(path, { waitUntil: "networkidle" });

      await expect(page.locator("body")).toContainText(shows);
      expect(failed, "requests that 404'd").toEqual([]);
      expect(crashed, "console errors").toEqual([]);
    });
  });

  test("publishes Storybook alongside the app, not as a second site", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failed.push(`${String(response.status())} ${response.url()}`);
      }
    });

    await page.goto("storybook/", { waitUntil: "networkidle" });

    await expect(page.getByText("Storybook", { exact: false }).first()).toBeVisible();
    expect(failed, "requests that 404'd").toEqual([]);
  });
});
