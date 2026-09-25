import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/primitives/Price";

import styles from "./ProductTile.module.css";

export interface ProductTileProps {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly basePrice: number;
  readonly imageUrl: string;
}

export const ProductTile = ({ id, name, brand, basePrice, imageUrl }: ProductTileProps) => (
  <Link href={`/phones/${id}`} className={styles.tile}>
    <span className={styles.imageWrapper}>
      <Image
        src={imageUrl}
        alt={`${brand} ${name}`}
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
