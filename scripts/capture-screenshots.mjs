#!/usr/bin/env node
/**
 * One-off design-QA tool: screenshots the three views at three viewport
 * widths so they can be compared side-by-side against the matching Figma
 * frame exports in design/figma-reference/. Not part of the test suite or
 * CI — run manually with `pnpm screenshots` while `pnpm dev` is running.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://prueba-tecnica-api-tienda-moviles.onrender.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "87909682e6cd74208f41a6ef39fe4191";
const CART_STORAGE_KEY = "mobile-ecommerce:cart";

const OUTPUT_DIR = path.join(process.cwd(), "design", "app-screenshots");

// Widths mirror the breakpoints already used in the component CSS modules
// (768 / 1024) and the one CONFIRMED Figma frame width (1920).
const VIEWPORTS = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

async function fetchAProductId() {
  const response = await fetch(`${API_BASE_URL}/products?limit=1`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Could not fetch a product id to screenshot (status ${response.status})`);
  }
  const [product] = await response.json();
  return product.id;
}

async function seedCart(page, productId) {
  // Runs before every navigation in this page's context, so the cart is
  // populated before the app's first render reads localStorage.
  await page.addInitScript(
    ({ key, item }) => {
      window.localStorage.setItem(key, JSON.stringify([item]));
    },
    {
      key: CART_STORAGE_KEY,
      item: {
        cartItemId: `${productId}-screenshot-seed`,
        productId,
        name: "Screenshot seed device",
        brand: "Seed",
        imageUrl: "",
        color: "Seed color",
        storage: "128GB",
        unitPrice: 999,
      },
    },
  );
}

async function capture(page, name) {
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: true });
  console.log(`  wrote ${name}.png`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Fetching a real product id for the detail screenshot...");
  const productId = await fetchAProductId();
  console.log(`Using product ${productId}`);

  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    console.log(`\n${viewport.name} (${viewport.width}x${viewport.height})`);
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });

    const listing = await context.newPage();
    await listing.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await capture(listing, `${viewport.name}-listing`);
    await listing.close();

    const detail = await context.newPage();
    await detail.goto(`${BASE_URL}/phones/${productId}/`, { waitUntil: "networkidle" });
    await capture(detail, `${viewport.name}-detail`);
    await detail.close();

    const cart = await context.newPage();
    await seedCart(cart, productId);
    await cart.goto(`${BASE_URL}/cart/`, { waitUntil: "networkidle" });
    await capture(cart, `${viewport.name}-cart`);
    await cart.close();

    await context.close();
  }

  await browser.close();
  console.log(`\nDone. Screenshots saved to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
