import { useId } from "react";
import type { ProductSpecs } from "@/lib/api/types";
import styles from "./SpecsList.module.css";

const SPEC_FIELDS: { key: keyof ProductSpecs; label: string }[] = [
  { key: "screen", label: "Screen" },
  { key: "resolution", label: "Resolution" },
  { key: "processor", label: "Processor" },
  { key: "mainCamera", label: "Main camera" },
  { key: "selfieCamera", label: "Selfie camera" },
  { key: "battery", label: "Battery" },
  { key: "os", label: "OS" },
  { key: "screenRefreshRate", label: "Screen refresh rate" },
];

/**
 * Renders brand, name, description and all 8 ProductSpecs fields as a
 * labelled list, in the exact row order confirmed on the real Figma
 * "Specification row" instances (node 20758:10425, Desktop / Detail /
 * Filled, and its mobile equivalent 20758:18953): Brand, Name,
 * Description, then the 8 technical fields. There is no "base price" row
 * in the real spec table — price is only shown once, near the title.
 */
export interface SpecsListProps {
  brand: string;
  name: string;
  specs: ProductSpecs;
  description: string;
}

export function SpecsList({ brand, name, specs, description }: SpecsListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Specifications
      </h2>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.term}>Brand</dt>
          <dd className={styles.value}>{brand}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>Name</dt>
          <dd className={styles.value}>{name}</dd>
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
