"use client";

import { useId } from "react";

import type { ColorOption } from "@/lib/api/types";

import styles from "./ColorSelector.module.css";

export interface ColorSelectorProps {
  readonly colors: readonly ColorOption[];
  readonly selected: ColorOption | null;
  readonly onSelect: (color: ColorOption) => void;
}

export const ColorSelector = ({ colors, selected, onSelect }: ColorSelectorProps) => {
  const labelId = useId();

  return (
    <div className={styles.wrapper}>
      <span id={labelId} className={styles.label}>
        COLOR. PICK YOUR FAVOURITE.
      </span>
      <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
        {colors.map((color, index) => {
          const isSelected = selected?.name === color.name;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color.name}
              title={color.name}
              className={`${styles.swatchWrapper} ${isSelected ? styles.selected : ""}`}
              data-color-index={index}
              onClick={() => onSelect(color)}
            >
              <span className={styles.swatch} style={{ backgroundColor: color.hexCode }} />
            </button>
          );
        })}
      </div>
      <p className={styles.selectedName}>{(selected ?? colors[0])?.name}</p>
    </div>
  );
};
