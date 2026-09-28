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
import { useViewportPrefetch } from "./useViewportPrefetch";

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

  const [isPointedAt, setIsPointedAt] = useState(false);
  const anchor = useViewportPrefetch(`/phones/${id}`);

  const [isReturnedTo, setIsReturnedTo] = useState(() => takeReturnedFromProduct() === id);

  const markPointedAt = () => {
    setIsPointedAt(true);
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
      prefetch={false}
      ref={anchor}
      onMouseEnter={markPointedAt}
      onFocus={markPointedAt}
      onTouchStart={markPointedAt}
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
