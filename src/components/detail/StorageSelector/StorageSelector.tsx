"use client";

import { useId } from "react";
import type { StorageOption } from "@/lib/api/types";
import styles from "./StorageSelector.module.css";

/**
 * Storage capacity selector. Same single-select radio-group pattern as
 * ColorSelector. Options render only the capacity ("256 GB") — no price —
 * matching the real Figma component exactly. The real-time price update
 * the brief asks for still happens: PhoneDetailView's headline price
 * derives from `selectedStorage.price` (the confirmed live-API quirk that
 * storageOptions[].price is an ABSOLUTE value, not a delta over basePrice),
 * it's just not duplicated onto every option button too.
 */
export interface StorageSelectorProps {
  options: StorageOption[];
  selected: StorageOption | null;
  onSelect: (option: StorageOption) => void;
}

export function StorageSelector({ options, selected, onSelect }: StorageSelectorProps) {
  const labelId = useId();

  return (
    <div className={styles.wrapper}>
      <span id={labelId} className={styles.label}>
        STORAGE. HOW MUCH SPACE DO YOU NEED?
      </span>
      <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => {
          const isSelected = selected?.capacity === option.capacity;
          return (
            <button
              key={option.capacity}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`${styles.option} ${isSelected ? styles.selected : ""}`}
              onClick={() => onSelect(option)}
            >
              <span className={styles.capacity}>{option.capacity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
