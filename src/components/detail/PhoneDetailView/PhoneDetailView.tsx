"use client";

import { AddToCartButton } from "@/components/detail/AddToCartButton";
import { PhoneHero } from "@/components/detail/PhoneHero";
import { SelectorsPanel } from "@/components/detail/SelectorsPanel";
import { SimilarProducts } from "@/components/detail/SimilarProducts";
import { SpecsList } from "@/components/detail/SpecsList";
import { Price } from "@/components/primitives/Price";
import type { ProductDetail } from "@/lib/api/types";

import styles from "./PhoneDetailView.module.css";
import { useProductSelection } from "./useProductSelection";

export interface PhoneDetailViewProps {
  product: ProductDetail;
}

export const PhoneDetailView = ({ product }: PhoneDetailViewProps) => {
  const { selection, heroColor, selectColor, selectStorage } = useProductSelection(product);

  const variants = product.colorOptions.map((color) => ({
    key: color.name,
    imageUrl: color.imageUrl,
  }));
  const displayPrice = selection.storage?.price ?? product.basePrice;

  return (
    <>
      <div className={styles.layout}>
        {heroColor === null ? null : (
          <PhoneHero variants={variants} activeKey={heroColor.name} name={product.name} />
        )}
        <div className={styles.info}>
          <div className={styles.titlePrice}>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>
              <Price value={displayPrice} />
            </p>
          </div>
          <SelectorsPanel
            colors={product.colorOptions}
            selectedColor={selection.color}
            onSelectColor={selectColor}
            storageOptions={product.storageOptions}
            selectedStorage={selection.storage}
            onSelectStorage={selectStorage}
          />
          <AddToCartButton
            productId={product.id}
            name={product.name}
            brand={product.brand}
            selectedColor={selection.color}
            selectedStorage={selection.storage}
          />
        </div>
      </div>
      <SpecsList
        brand={product.brand}
        name={product.name}
        specs={product.specs}
        description={product.description}
      />
      <SimilarProducts products={product.similarProducts} />
    </>
  );
};
