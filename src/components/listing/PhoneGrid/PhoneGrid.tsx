import { ProductTile } from "@/components/shared/ProductTile";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";
import styles from "./PhoneGrid.module.css";

export interface PhoneGridProps {
  products: ProductListItem[];
}

/**
 * Responsive grid of `ProductTile`s (brief §1). Rendered as a semantic
 * list (`<ul role="list">`) rather than bare `div`s, and always keyed via
 * `transform.keyFor(product, index)` - never raw `product.id` - because the
 * live `/products` listing is confirmed to contain duplicate ids.
 */
export function PhoneGrid({ products }: PhoneGridProps) {
  return (
    <ul className={styles.grid} role="list">
      {products.map((product, index) => (
        <li key={keyFor(product, index)} className={styles.item}>
          <ProductTile
            id={product.id}
            name={product.name}
            brand={product.brand}
            basePrice={product.basePrice}
            imageUrl={product.imageUrl}
          />
        </li>
      ))}
    </ul>
  );
}
