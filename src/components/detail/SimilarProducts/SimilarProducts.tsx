"use client";

import { memo, useEffect, useId, useRef, useState } from "react";

import { ProductTile } from "@/components/shared/ProductTile";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";

import styles from "./SimilarProducts.module.css";

export interface SimilarProductsProps {
  readonly products: readonly ProductListItem[];
}

const SimilarProductsList = ({ products }: SimilarProductsProps) => {
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState({ widthPercent: 100, leftPercent: 0 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const updateThumb = () => {
      const { scrollWidth, clientWidth, scrollLeft } = list;
      if (scrollWidth <= clientWidth) {
        setThumb({ widthPercent: 100, leftPercent: 0 });
        return;
      }
      const widthPercent = (clientWidth / scrollWidth) * 100;
      const maxScrollLeft = scrollWidth - clientWidth;
      const leftPercent = (scrollLeft / maxScrollLeft) * (100 - widthPercent);
      setThumb({ widthPercent, leftPercent });
    };

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
};

export const SimilarProducts = memo(SimilarProductsList);
