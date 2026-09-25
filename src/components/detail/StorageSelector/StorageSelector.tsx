"use client";

import { useId } from "react";

import type { StorageOption } from "@/lib/api/types";

import styles from "./StorageSelector.module.css";

export interface StorageSelectorProps {
  readonly options: readonly StorageOption[];
  readonly selected: StorageOption | null;
  readonly onSelect: (option: StorageOption) => void;
}

export const StorageSelector = ({ options, selected, onSelect }: StorageSelectorProps) => {
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
};
