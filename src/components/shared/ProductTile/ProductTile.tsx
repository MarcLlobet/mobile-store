"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/primitives/Price";
import { TilePendingHint } from "@/components/shared/TilePendingHint";
import { useTranslation } from "@/i18n";
import {
  rememberOpenedProduct,
  sharedImageName,
  takeReturnedFromProduct,
} from "@/lib/view-transitions";

import styles from "./ProductTile.module.css";

export interface ProductTileProps {
  id: string;
  name: string;
  brand: string;
  basePrice: number;
  imageUrl: string;
  isFirstImages?: boolean;
}

export const ProductTile = ({
  id,
  name,
  brand,
  basePrice,
  imageUrl,
  isFirstImages = false,
}: ProductTileProps) => {
  const { t } = useTranslation();

  /*
   * Detail routes are statically generated, so Next's default prefetch would pull
   * each one's full RSC payload the moment the tile scrolls into view — the whole
   * catalog, whether or not anyone means to open it. Hold prefetching back until
   * the visitor points at this tile, then hand `Link` back its normal behaviour.
   * `false` means never in the App Router, hence the swap to `null` rather than a
   * manual `router.prefetch`.
   */
  const [isIntended, setIsIntended] = useState(false);

  /*
   * Only the tile being pointed at carries the shared name. A named element is
   * captured and animated independently, so naming the whole grid would send
   * every image off on its own path instead of letting the page fade as one.
   */
  const [isPointedAt, setIsPointedAt] = useState(false);

  /*
   * Coming back from this product's detail page, wear the name from the very
   * first render so the hero has something to morph down into. Reading the memory
   * consumes it, so exactly one tile can claim it. It is empty on a cold load,
   * which keeps this render identical to the server's.
   */
  const [isReturnedTo, setIsReturnedTo] = useState(() => takeReturnedFromProduct() === id);

  const markIntended = () => {
    setIsIntended(true);
    setIsPointedAt(true);
    // Pointing at the tile supersedes the name it was given for the return trip.
    setIsReturnedTo(false);
  };
  const clearPointedAt = () => {
    setIsPointedAt(false);
  };
  const rememberForTheWayBack = () => {
    rememberOpenedProduct(id);
  };

  return (
    <Link
      href={`/phones/${id}`}
      className={styles.tile}
      prefetch={isIntended ? null : false}
      onMouseEnter={markIntended}
      onFocus={markIntended}
      onTouchStart={markIntended}
      onMouseLeave={clearPointedAt}
      onBlur={clearPointedAt}
      onClick={rememberForTheWayBack}
    >
      <TilePendingHint />
      <div className={styles.tileInnerWrapper}>
        <span
          className={styles.imageWrapper}
          style={
            isPointedAt || isReturnedTo ? { viewTransitionName: sharedImageName(id) } : undefined
          }
        >
          <Image
            src={imageUrl}
            alt={t("product.image_alt", { brand, name })}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
            loading={isFirstImages ? "eager" : undefined}
          />
        </span>
        <span className={styles.info}>
          <span className={styles.brandName}>
            <span className={styles.brand}>{brand}</span>
            <span className={styles.name}>{name}</span>
          </span>
          <span className={styles.price}>
            <Price value={basePrice} />
          </span>
        </span>
      </div>
    </Link>
  );
};
