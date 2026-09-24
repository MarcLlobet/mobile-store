import { useId } from "react";
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
 */
export interface SimilarProductsProps {
  products: ProductListItem[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const headingId = useId();

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Similar items
      </h2>
      <ul className={styles.list}>
        {products.map((product, index) => (
          <li key={keyFor(product, index)} className={styles.item}>
            <ProductTile {...product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
