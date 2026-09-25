import { ProductTile } from "@/components/shared/ProductTile";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";

import styles from "./PhoneGrid.module.css";

export interface PhoneGridProps {
  readonly products: readonly ProductListItem[];
}

export const PhoneGrid = ({ products }: PhoneGridProps) => (
  // `list-style: none` drops list semantics in Safari/VoiceOver; the explicit role restores them.
  // eslint-disable-next-line jsx-a11y/no-redundant-roles
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
