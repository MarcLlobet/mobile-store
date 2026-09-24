import { useId } from "react";
import { Price } from "@/components/primitives/Price";
import type { ProductSpecs } from "@/lib/api/types";
import styles from "./SpecsList.module.css";

const SPEC_FIELDS: { key: keyof ProductSpecs; label: string }[] = [
  { key: "screen", label: "Screen" },
  { key: "resolution", label: "Resolution" },
  { key: "processor", label: "Processor" },
  { key: "mainCamera", label: "Main camera" },
  { key: "selfieCamera", label: "Selfie camera" },
  { key: "battery", label: "Battery" },
  { key: "os", label: "Operating system" },
  { key: "screenRefreshRate", label: "Screen refresh rate" },
];

/**
 * Renders all 8 ProductSpecs fields plus base price and the product
 * description as a labelled list.
 */
export interface SpecsListProps {
  specs: ProductSpecs;
  basePrice: number;
  description: string;
}

export function SpecsList({ specs, basePrice, description }: SpecsListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Technical specifications
      </h2>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.term}>Base price</dt>
          <dd className={styles.value}>
            <Price value={basePrice} />
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>Description</dt>
          <dd className={styles.value}>{description}</dd>
        </div>
        {SPEC_FIELDS.map(({ key, label }) => (
          <div className={styles.row} key={key}>
            <dt className={styles.term}>{label}</dt>
            <dd className={styles.value}>{specs[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
