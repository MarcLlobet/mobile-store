"use client";

import { useState } from "react";
import { normalizeImageUrl } from "@/lib/api/transform";
import type { ColorOption, ProductDetail, StorageOption } from "@/lib/api/types";
import { BackButton } from "@/components/detail/BackButton";
import { PhoneHero } from "@/components/detail/PhoneHero";
import { SelectorsPanel } from "@/components/detail/SelectorsPanel";
import { SpecsList } from "@/components/detail/SpecsList";
import { AddToCartButton } from "@/components/detail/AddToCartButton";
import { SimilarProducts } from "@/components/detail/SimilarProducts";
import { Price } from "@/components/primitives/Price";
import styles from "./PhoneDetailView.module.css";

/**
 * Client-side orchestrator for the Detail view. The Server Component page
 * (`app/phones/[id]/page.tsx`) does the one `fetchProductById` call at build
 * time and hands the whole `ProductDetail` down as a prop — this component
 * owns the interactive part: `selectedColor`/`selectedStorage` state, which
 * is the single source of truth that PhoneHero, the price display, and
 * AddToCartButton's enabled-state all derive from.
 *
 * Per the plan: `heroImage = selectedColor?.imageUrl ?? colorOptions[0].imageUrl`
 * and `displayPrice = selectedStorage?.price ?? basePrice` — i.e. the hero
 * image and price always show *something* sensible before a selection is
 * made, while the selectors themselves show nothing as "checked" and
 * AddToCartButton stays disabled until the user actively picks both.
 */
export interface PhoneDetailViewProps {
  product: ProductDetail;
}

export function PhoneDetailView({ product }: PhoneDetailViewProps) {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<StorageOption | null>(null);

  const heroImageUrl = normalizeImageUrl(
    selectedColor?.imageUrl ?? product.colorOptions[0]?.imageUrl ?? product.imageUrl,
  );
  const displayPrice = selectedStorage?.price ?? product.basePrice;

  return (
    <main className={styles.page}>
      <BackButton />
      <div className={styles.layout}>
        <PhoneHero imageUrl={heroImageUrl} name={product.name} />
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>
            <Price value={displayPrice} />
          </p>
          <SelectorsPanel
            colors={product.colorOptions}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            storageOptions={product.storageOptions}
            selectedStorage={selectedStorage}
            onSelectStorage={setSelectedStorage}
          />
          <AddToCartButton
            productId={product.id}
            name={product.name}
            brand={product.brand}
            selectedColor={selectedColor}
            selectedStorage={selectedStorage}
          />
          <SpecsList
            brand={product.brand}
            name={product.name}
            specs={product.specs}
            description={product.description}
          />
        </div>
      </div>
      <SimilarProducts products={product.similarProducts} />
    </main>
  );
}
