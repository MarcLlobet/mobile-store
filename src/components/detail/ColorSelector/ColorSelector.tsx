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
 * via `aria-checked`, to sighted users via the wrapper's border color
 * change (a lightness/value contrast, not hue-only, so it still works for
 * colorblind users) plus the visible color-name label below the swatches.
 * The clickable radio is the outer wrapper (grey border, black when
 * selected); the inner swatch is a plain decorative span with its own
 * transparent border, so the wrapper's border reads as a real ring around
 * the color fill rather than needing a box-shadow trick.
 *
 * Pointing at a swatch previews its color in the hero image, but there is no
 * hover state and no hover handler here: `data-color-index` pairs each swatch
 * with the hero image at the same index, and a `:has()` rule in
 * PhoneDetailView.module.css flips which one is opaque. Hovering therefore
 * cannot select, cannot re-render, and cannot reach the cart — the preview
 * lives entirely outside React. Each swatch's `title`/`aria-label` names the
 * color it previews.
 *
 * Nothing is checked until the user picks: `selected` starts `null`, which is
 * what keeps AddToCartButton gated. The hero still shows the first color — see
 * PhoneDetailView, which derives that separately — but showing a color is not
 * selecting it.
 *
 * The name label therefore always renders *some* name (the selected one, or
 * the first color as a stand-in) so its line box always exists, and CSS hides
 * it with `visibility` until something is actually selected. That keeps the
 * text out of both the viewport and the accessibility tree without ever
 * collapsing the box, so selecting a color can't shift the layout below it.
 * No extra prop or state carries that: the stylesheet reads the `aria-checked`
 * the swatches already publish.
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
              // Pairs this swatch with the hero image at the same index — the
              // hook the CSS-only hover preview matches on. See the doc above.
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
}
