/**
 * Small, pure helpers for working around confirmed live-data quirks of the
 * external API (see types.ts doc comment and the plan's Context section).
 */

/**
 * The API sometimes serves `imageUrl` as `http://...onrender.com/...` even
 * though the API itself is `https://`. The same path also works fine over
 * https. Browsers will otherwise flag/block this as mixed content on an
 * https-served page, so always normalize before rendering.
 */
export function normalizeImageUrl(url: string): string {
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

/**
 * The live `/products` listing can contain duplicate `id`s (confirmed:
 * `XMI-RN13P5G` appears twice in the first 20 items). React list rendering
 * must never key directly off `product.id` — use this instead, which stays
 * stable for a given render of a given array (list index) while still being
 * unique even when ids collide.
 */
export function keyFor(product: { id: string }, index: number): string {
  return `${product.id}-${index}`;
}
