"use client";

import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/primitives/Price";
import { useTranslation } from "@/i18n";

import styles from "./ProductTile.module.css";

export interface ProductTileProps {
  id: string;
  name: string;
  brand: string;
  basePrice: number;
  imageUrl: string;
}

export const ProductTile = ({ id, name, brand, basePrice, imageUrl }: ProductTileProps) => {
  const { t } = useTranslation();

  return (
    <Link href={`/phones/${id}`} className={styles.tile}>
      <span className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={t("product.image_alt", { brand, name })}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 25vw"
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
    </Link>
  );
};
