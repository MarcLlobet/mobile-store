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

// Widths match the actual Figma frame widths exactly (design/figma-reference/),
// confirmed via the Figma file's Desktop/Tablet/Mobile design frames, so
// app screenshots line up pixel-for-pixel against the reference exports.
const VIEWPORTS = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "mobile", width: 393, height: 852 },
];

async function fetchAScreenshotProduct() {
  const listResponse = await fetch(`${API_BASE_URL}/products?limit=1`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!listResponse.ok) {
    throw new Error(`Could not fetch a product id to screenshot (status ${listResponse.status})`);
  }
  const [{ id }] = await listResponse.json();

  const detailResponse = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!detailResponse.ok) {
    throw new Error(`Could not fetch product ${id} detail to seed the cart (status ${detailResponse.status})`);
  }
  return detailResponse.json();
}

async function seedCart(page, product) {
  const color = product.colorOptions[0];
  const storage = product.storageOptions[0];
  // Runs before every navigation in this page's context, so the cart is
  // populated before the app's first render reads localStorage. Uses real
  // product data (not empty/placeholder strings) so the seeded row doesn't
  // trigger real console errors (e.g. an empty next/image src) that would
  // otherwise look like — but aren't — an app bug in the screenshot.
  await page.addInitScript(
    ({ key, item }) => {
      window.localStorage.setItem(key, JSON.stringify([item]));
    },
    {
      key: CART_STORAGE_KEY,
      item: {
        cartItemId: `${product.id}-${color.name}-${storage.capacity}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        imageUrl: color.imageUrl,
        color: color.name,
        storage: storage.capacity,
        unitPrice: storage.price,
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

  console.log("Fetching a real product for the detail/cart screenshots...");
  const product = await fetchAScreenshotProduct();
  console.log(`Using product ${product.id}`);

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
    await detail.goto(`${BASE_URL}/phones/${product.id}/`, { waitUntil: "networkidle" });
    await capture(detail, `${viewport.name}-detail`);
    await detail.close();

    const cart = await context.newPage();
    await seedCart(cart, product);
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
