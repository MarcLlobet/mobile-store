"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./PhoneHero.module.css";

/**
 * Large hero image for the Detail view.
 *
 * Every colour variant's photo is rendered up front, stacked in one grid
 * cell, with only the active one opaque. They all carry `loading="eager"`, so
 * the browser fetches the whole set while the page is loading rather than
 * when a swatch is picked or hovered. Because the hidden variants are
 * `opacity: 0` rather than `display: none`, the browser paints and decodes
 * them too — so revealing one is a compositor-only opacity change on a DOM
 * node that never unmounts. No request, no decode stall, no blank frame.
 *
 * The effect below then pre-*decodes* them. Painting at `opacity: 0` already
 * gets the browser to decode in practice, but that is a behaviour, not a
 * guarantee: on a slow CPU the decode can be deferred, and the first reveal
 * would flash. `img.decode()` makes it explicit — once it resolves, showing
 * that variant is a pure composite. It does not speed up the download (the
 * promise waits for the fetch either way); it removes the decode from the
 * interaction.
 *
 * `priority` is deprecated in Next 16 in favour of `preload`, but `preload`
 * is explicitly the wrong tool here: it injects a `<link rel=preload>` per
 * image, and the docs say not to use it when several images compete for LCP.
 * `loading="eager"` + `fetchPriority` is the documented alternative — the
 * visible variant is fetched at high priority, the rest at low, so warming
 * the cache never delays the one the user is actually looking at. The `<img>`
 * tags are in the statically exported HTML, so the browser's preload scanner
 * finds all of them during parse, before any JavaScript runs.
 *
 * Each image carries `data-variant-index`, which pairs it with the colour
 * swatch at the same index so the Detail view's CSS-only hover preview can
 * reveal it with no JavaScript running at all. That is also why callers must
 * keep `variants` 1:1 and in order with their colour list.
 *
 * Variants are addressed by an opaque `key` (the colour name), never by image
 * URL: the API is known to serve the same photo for two differently-named
 * colours, and keying by URL would collapse those two into one entry so that
 * hovering the second colour showed the first one's image. Two variants with
 * the same `src` render as two `<img>` elements here; the browser coalesces
 * them into a single request on its own.
 *
 * Uses intrinsic width/height (the confirmed Figma frame size, 510x630)
 * instead of `fill` + a forced aspect-ratio box: the rendered box then
 * follows whatever a given photo's own real proportions are, scaled to
 * fit the 510px column, rather than a fixed 630px-tall box that would
 * letterbox (and look oversized/misaligned) for any photo with a
 * different intrinsic ratio. The grid stack sizes to the tallest variant,
 * so switching colour can't nudge the rest of the page either.
 */
export interface PhoneHeroVariant {
  /** Stable, unique identifier for this variant — the colour's name. */
  key: string;
  imageUrl: string;
}

export interface PhoneHeroProps {
  /** Every variant to pre-fetch, in display order. */
  variants: PhoneHeroVariant[];
  /** The `key` of the variant to show. */
  activeKey: string;
  name: string;
}

export function PhoneHero({ variants, activeKey, name }: PhoneHeroProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  // Keyed on the variant identities, not the array: `variants` is rebuilt on
  // every parent render (including every hover), and depending on it directly
  // would re-run this on each one.
  const variantKeys = variants.map((variant) => variant.key).join("\u0000");

  useEffect(() => {
    for (const image of stackRef.current?.querySelectorAll("img") ?? []) {
      // Optional-called because jsdom has no decode(); rejections are
      // expected and ignorable (an unreachable image, or a src swapped
      // mid-decode) — this is a warm-up, never a correctness dependency.
      void image.decode?.().catch(() => {});
    }
  }, [variantKeys]);

  if (variants.length === 0) {
    return null;
  }

  // Defensive: something must always be visible, so an unknown `activeKey`
  // falls back to the first variant rather than rendering an empty box.
  const activeIndex = variants.findIndex((variant) => variant.key === activeKey);
  const activeVariantIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className={styles.wrapper}>
      <div className={styles.stack} ref={stackRef}>
        {variants.map((variant, index) => {
          const isActive = index === activeVariantIndex;
          return (
            <Image
              key={variant.key}
              src={variant.imageUrl}
              data-variant-index={index}
              // Only the visible variant is exposed to assistive tech — the
              // others are cache-warming copies of the same product. The name
              // deliberately does not follow a hover preview: re-announcing
              // the image on every pointer move would make the page noisy.
              alt={isActive ? name : ""}
              aria-hidden={!isActive}
              width={510}
              height={630}
              className={`${styles.image} ${isActive ? styles.active : ""}`}
              sizes="(max-width: 768px) 100vw, 510px"
              loading="eager"
              fetchPriority={isActive ? "high" : "low"}
            />
          );
        })}
      </div>
    </div>
  );
}
