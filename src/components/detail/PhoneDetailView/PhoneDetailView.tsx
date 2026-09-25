"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { normalizeImageUrl } from "@/lib/api/transform";
import type { ColorOption, ProductDetail, StorageOption } from "@/lib/api/types";
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
 * owns the interactive part.
 *
 * ## One state
 *
 * There is exactly one piece of state here: `chosen`, what the user has
 * actively picked on this visit. Everything the UI renders is *derived* from
 * it, per field:
 *
 *     chosen -> the cart's last line for this phone -> the first option
 *
 * so the persisted choice (localStorage, reached through CartContext) and the
 * live one are the same value rather than two states kept in sync. The cart is
 * read through `useCart()` rather than `localStorage` directly on purpose:
 * this route is prerendered at build time, and reading storage during render
 * would make the server HTML and the first client render disagree.
 * `CartProvider` already does that read once, after mount.
 *
 * Both fields stay `null` until they are actually picked (or arrive from a
 * previous cart line), which is what keeps AddToCartButton gated on the pair.
 * Showing a colour is deliberately not the same as selecting one: the hero
 * falls back to the first option so the page never renders without an image,
 * but that fallback lives in `heroColor` below and never reaches `selection`,
 * the swatches' `aria-checked`, or the cart.
 *
 * ## No hover state
 *
 * Previewing a colour on hover is done entirely in CSS (see
 * PhoneDetailView.module.css). Every variant is already in the DOM, fetched
 * and decoded by PhoneHero, so `:has()` only has to flip which one is opaque
 * — no React state, no re-render, no handler, and no risk of a preview
 * leaking into what gets added to the cart. The `data-color-index` on each
 * swatch and the `data-variant-index` on each hero image are the contract
 * those rules match on, which is why both lists stay 1:1 with
 * `product.colorOptions`.
 *
 * SpecsList and SimilarProducts are memoized: they take stable slices of the
 * same `product` object, so a selection never re-renders the spec table or the
 * similar-product tiles.
 */
export interface PhoneDetailViewProps {
  product: ProductDetail;
}

interface Selection {
  color: ColorOption | null;
  storage: StorageOption | null;
}

export function PhoneDetailView({ product }: PhoneDetailViewProps) {
  const { items } = useCart();
  const [chosen, setChosen] = useState<Selection | null>(null);

  const colorOptions = product.colorOptions ?? [];

  // The most recent cart line for this phone, if any — "what I picked last
  // time", which is the only thing localStorage knows about a product. Looked
  // up by name/capacity against the *current* options so a discontinued
  // variant falls through to the default instead of resurrecting itself.
  const lastCartLine = items.findLast((item) => item.productId === product.id);
  const cartColor = lastCartLine
    ? colorOptions.find((color) => color.name === lastCartLine.color)
    : undefined;
  const cartStorage = lastCartLine
    ? product.storageOptions.find((storage) => storage.capacity === lastCartLine.storage)
    : undefined;

  const selection: Selection = {
    color: chosen?.color ?? cartColor ?? null,
    storage: chosen?.storage ?? cartStorage ?? null,
  };

  // What the hero *shows*, which is not what is *selected*: with no selection
  // yet, the first colour stands in so the page always has an image.
  const heroColor = selection.color ?? colorOptions[0] ?? null;

  // Picking one field promotes the whole derived selection into state, so the
  // field the user didn't touch keeps whatever it had resolved to.
  const selectColor = (color: ColorOption) => setChosen({ ...selection, color });
  const selectStorage = (storage: StorageOption) => setChosen({ ...selection, storage });

  // `colorOptions` is the only source of images on this route — the recorded
  // `/products/{id}` response has no top-level `imageUrl` (see
  // lib/api/types.ts). One variant per *color*, in the same order, and NOT
  // deduped by url: the API repeats one photo across two named colors, and
  // collapsing those would break both the index pairing the hover CSS relies
  // on and the ability to address the second color at all.
  const variants = colorOptions.map((color) => ({
    key: color.name,
    imageUrl: normalizeImageUrl(color.imageUrl),
  }));
  const displayPrice = selection.storage?.price ?? product.basePrice;

  return (
    <>
      <div className={styles.layout}>
        {heroColor !== null && (
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
            colors={colorOptions}
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
      {/* CONFIRMED structure: on the real Figma frame, "Specs" is a
          full-width sibling of "Product info + Img" (same level as
          "Similar items"), not nested inside the narrow info column next
          to the image. */}
      <SpecsList
        brand={product.brand}
        name={product.name}
        specs={product.specs}
        description={product.description}
      />
      <SimilarProducts products={product.similarProducts} />
    </>
  );
}
