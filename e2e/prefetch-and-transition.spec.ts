import { expect, test, type Page } from "@playwright/test";

/** Next writes one RSC payload per route segment next to each page's HTML. */
const isDetailPayload = (url: string): boolean => /\/phones\/[^/]+\/__next.*\.txt/.test(url);

const productOf = (url: string): string => /\/phones\/([^/]+)\//.exec(url)?.[1] ?? "";

const watchPayloads = (page: Page): string[] => {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (isDetailPayload(request.url())) {
      seen.push(request.url());
    }
  });
  return seen;
};

test.describe("prefetching what is on screen", () => {
  // The 400ms dwell itself is covered in ProductTile.test.tsx, which drives a fake
  // IntersectionObserver and fake timers. Asserting it here would race the page load.
  test("warms the tiles on screen without pulling the whole catalog", async ({ page }) => {
    const payloads = watchPayloads(page);

    await page.goto("", { waitUntil: "networkidle" });
    await expect.poll(() => payloads.length).toBeGreaterThan(0);

    const hrefs = await page
      .locator('a[href*="/phones/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    const lastOnPage = productOf(`${hrefs.at(-1) ?? ""}/`);
    const warmed = new Set(payloads.map((url) => productOf(url)));

    expect(warmed.size, "only part of the grid should be warmed").toBeLessThan(hrefs.length);
    expect([...warmed], "a tile far below the fold is not worth fetching").not.toContain(
      lastOnPage,
    );
  });

  test("asks for nothing more when a warmed tile is finally opened", async ({ page }) => {
    const payloads = watchPayloads(page);

    await page.goto("", { waitUntil: "networkidle" });
    const link = page.getByRole("link", { name: /Galaxy S24 Ultra/i }).first();
    await expect.poll(() => payloads.map((url) => productOf(url))).toContain("SMG-S24U");
    const beforeClick = payloads.length;

    await link.click();
    await expect(page).toHaveURL(/\/phones\/SMG-S24U\//);

    expect(payloads.length - beforeClick, "the click should already be cached").toBe(0);
  });
});

test.describe("the cross-page transition", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__transitions = [];
      const start = document.startViewTransition?.bind(document);
      if (!start) {
        return;
      }
      document.startViewTransition = (...args: Parameters<typeof start>) => {
        const named = [...document.querySelectorAll("*")]
          .map((element) => getComputedStyle(element).viewTransitionName)
          .filter((name) => name !== "" && name !== "none");
        const transition = start(...args);
        window.__transitions?.push({ named });
        return transition;
      };
    });
  });

  test("animates into the detail page with one product image taking part", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    const link = page.getByRole("link", { name: /Galaxy S24 Ultra/i }).first();
    await link.hover();
    await link.click();
    await expect(page).toHaveURL(/\/phones\//);

    const transitions = await page.evaluate(() => window.__transitions ?? []);
    expect(transitions, "a view transition should have started").toHaveLength(1);

    const named = transitions[0]?.named ?? [];
    expect(named, "the header opts out of the page animation").toContain("site-header");
    // Two tiles share the id XMI-RN13P5G, so naming every tile would repeat a name
    // and make the browser abandon the whole transition.
    expect(named.filter((name) => name.startsWith("product-image-"))).toEqual([
      "product-image-SMG-S24U",
    ]);
  });

  test("leaves the header untouched while the content animates", async ({ page }) => {
    await page.goto("", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.__header = document.querySelector("header");
    });

    await page
      .getByRole("link", { name: /Galaxy S24 Ultra/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/phones\//);

    expect(await page.evaluate(() => window.__header === document.querySelector("header"))).toBe(
      true,
    );
  });
});
