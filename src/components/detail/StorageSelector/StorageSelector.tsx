"use client";

import { useId } from "react";
import { Price } from "@/components/primitives/Price";
import type { StorageOption } from "@/lib/api/types";
import styles from "./StorageSelector.module.css";

/**
 * Storage capacity selector. Same single-select radio-group pattern as
 * ColorSelector. Each option shows its own ABSOLUTE price for that capacity
 * (confirmed live-API quirk — storageOptions[].price is not a delta added to
 * basePrice), via the shared Price primitive, so the price comparison across
 * tiers is visible directly in the selector, not just after selection.
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
              <Price value={option.price} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
