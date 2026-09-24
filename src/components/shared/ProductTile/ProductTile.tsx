import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/api/transform";
import { Price } from "@/components/primitives/Price";
import styles from "./ProductTile.module.css";

/**
 * Frozen contract (plan §4) — reused by the listing grid AND the detail
 * view's "Similar products" section. Consumers rendering a list of these
 * must key each instance with `transform.keyFor(product, index)`, not
 * `product.id`, because the live API can return duplicate ids.
 */
export interface ProductTileProps {
  id: string;
  name: string;
  brand: string;
  basePrice: number;
  imageUrl: string;
}

export function ProductTile({ id, name, brand, basePrice, imageUrl }: ProductTileProps) {
  return (
    <Link href={`/phones/${id}`} className={styles.tile}>
      <span className={styles.imageWrapper}>
        <Image
          src={normalizeImageUrl(imageUrl)}
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
}
