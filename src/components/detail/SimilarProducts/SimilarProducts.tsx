"use client";

import { memo, useEffect, useId, useRef, useState } from "react";
import { ProductTile } from "@/components/shared/ProductTile";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";
import styles from "./SimilarProducts.module.css";

/**
 * "Similar products" section — the API embeds `similarProducts` directly in
 * the `/products/{id}` response (no separate endpoint), so this component is
 * purely presentational, reusing the shared ProductTile card. Rendered as a
 * horizontally-scrollable row (Figma "Similar items"/"Carousel") without a
 * JS carousel library, per the plan.
 *
 * The native scrollbar is hidden and replaced with a custom track+thumb bar
 * below the list, matching the real Figma "Bar"/"Scroll" elements (a 1px
 * full-width grey track with a 1px black thumb). Figma's static mock draws
 * the thumb at a fixed 100px, but that number only made sense for its own
 * fixed mock content — here the thumb width/position is computed from the
 * real visible/total scroll ratio so it stays meaningful for any card count.
 */
export interface SimilarProductsProps {
  products: ProductListItem[];
}

/**
 * Memoized for the same reason as SpecsList: `products` is a stable slice of
 * the Detail view's `product`, so hovering a color swatch upstream never
 * re-renders these tiles (or re-runs the scroll-thumb effect keyed on them).
 */
export const SimilarProducts = memo(function SimilarProducts({ products }: SimilarProductsProps) {
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState({ widthPercent: 100, leftPercent: 0 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function updateThumb() {
      if (!list) return;
      const { scrollWidth, clientWidth, scrollLeft } = list;
      if (scrollWidth <= clientWidth) {
        setThumb({ widthPercent: 100, leftPercent: 0 });
        return;
      }
      const widthPercent = (clientWidth / scrollWidth) * 100;
      const maxScrollLeft = scrollWidth - clientWidth;
      const leftPercent = (scrollLeft / maxScrollLeft) * (100 - widthPercent);
      setThumb({ widthPercent, leftPercent });
    }

    updateThumb();
    list.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);
    return () => {
      list.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Similar items
      </h2>
      <ul ref={listRef} className={styles.list}>
        {products.map((product, index) => (
          <li key={keyFor(product, index)} className={styles.item}>
            <ProductTile {...product} />
          </li>
        ))}
      </ul>
      <div className={styles.scrollTrack} aria-hidden="true">
        <div
          className={styles.scrollThumb}
          style={{ width: `${thumb.widthPercent}%`, left: `${thumb.leftPercent}%` }}
        />
      </div>
    </section>
  );
});
