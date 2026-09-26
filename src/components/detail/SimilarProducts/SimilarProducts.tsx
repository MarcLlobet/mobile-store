"use client";

import { memo, useEffect, useId, useRef, useState } from "react";

import { ProductTile } from "@/components/shared/ProductTile";
import { useTranslation } from "@/i18n";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";
import { throttle } from "@/lib/utils/schedule";

import styles from "./SimilarProducts.module.css";

export interface SimilarProductsProps {
  products: readonly ProductListItem[];
}

const THUMB_UPDATE_MS = 50;

const SimilarProductsList = ({ products }: SimilarProductsProps) => {
  const headingId = useId();
  const { t } = useTranslation();
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

    const scheduled = throttle(updateThumb, THUMB_UPDATE_MS);
    const onEvent = () => {
      scheduled.run();
    };

    updateThumb();
    list.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent);
    return () => {
      scheduled.cancel();
      list.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
    };
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        {t("detail.similar_heading")}
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
