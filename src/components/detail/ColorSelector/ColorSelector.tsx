"use client";

import { useId } from "react";
import type { ColorOption } from "@/lib/api/types";
import styles from "./ColorSelector.module.css";

/**
 * Color swatch selector. Exactly one color is selected at a time, so it
 * follows the ARIA "single-select radio group" pattern (`role="radiogroup"`
 * + `role="radio"`/`aria-checked` per swatch) rather than togglable
 * `aria-pressed` buttons — `aria-pressed` doesn't apply to `role="radio"`
 * elements (and `eslint-plugin-jsx-a11y`'s `role-supports-aria-props` rule
 * rejects the combination). Selection state is conveyed to assistive tech
 * via `aria-checked`, to sighted users via the border color change (a
 * lightness/value contrast, not hue-only, so it still works for colorblind
 * users) plus the visible color-name label below the swatches — matches
 * the real Figma "Color" component exactly (border-color swap, no
 * checkmark, same border width both states).
 */
export interface ColorSelectorProps {
  colors: ColorOption[];
  selected: ColorOption | null;
  onSelect: (color: ColorOption) => void;
}

export function ColorSelector({ colors, selected, onSelect }: ColorSelectorProps) {
  const labelId = useId();

  return (
    <div className={styles.wrapper}>
      <span id={labelId} className={styles.label}>
        COLOR. PICK YOUR FAVOURITE.
      </span>
      <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
        {colors.map((color) => {
          const isSelected = selected?.name === color.name;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color.name}
              title={color.name}
              className={`${styles.swatch} ${isSelected ? styles.selected : ""}`}
              style={{ backgroundColor: color.hexCode }}
              onClick={() => onSelect(color)}
            />
          );
        })}
      </div>
      {selected && <p className={styles.selectedName}>{selected.name}</p>}
    </div>
  );
}
