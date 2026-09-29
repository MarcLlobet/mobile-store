"use client";

import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ProductTile } from "@/components/shared/ProductTile";
import { useTranslation } from "@/i18n";
import { keyFor } from "@/lib/api/transform";
import type { ProductListItem } from "@/lib/api/types";

import styles from "./PhoneGrid.module.css";

export interface PhoneGridProps {
  products: readonly ProductListItem[];
}

export const PhoneGrid = ({ products }: PhoneGridProps) => {
  const { t } = useTranslation();

  return (
    <ErrorBoundary
      fallback={() => (
        <p role="alert" className={styles.gridError}>
          {t("error.grid")}
        </p>
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul className={styles.grid} role="list">
        {products.map((product, index) => (
          <li key={keyFor(product, index)} className={styles.item}>
            <ProductTile
              id={product.id}
              name={product.name}
              brand={product.brand}
              basePrice={product.basePrice}
              imageUrl={product.imageUrl}
              isFirstImages={3 >= index}
            />
          </li>
        ))}
      </ul>
    </ErrorBoundary>
  );
};
