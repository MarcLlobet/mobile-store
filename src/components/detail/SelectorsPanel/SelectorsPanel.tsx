import { ColorSelector } from "@/components/detail/ColorSelector";
import { StorageSelector } from "@/components/detail/StorageSelector";
import type { ColorOption, StorageOption } from "@/lib/api/types";
import styles from "./SelectorsPanel.module.css";

/**
 * Pure composition of ColorSelector + StorageSelector. Deliberately stays
 * "dumb": it receives selectedColor/selectedStorage and their setters as
 * controlled props rather than owning any state itself, so PhoneHero, the
 * price display, and AddToCartButton's enabled-state (all siblings owned by
 * the parent client component) stay derived from one single source of
 * truth.
 */
export interface SelectorsPanelProps {
  colors: ColorOption[];
  selectedColor: ColorOption | null;
  onSelectColor: (color: ColorOption) => void;
  storageOptions: StorageOption[];
  selectedStorage: StorageOption | null;
  onSelectStorage: (option: StorageOption) => void;
}

export function SelectorsPanel({
  colors,
  selectedColor,
  onSelectColor,
  storageOptions,
  selectedStorage,
  onSelectStorage,
}: SelectorsPanelProps) {
  return (
    <div className={styles.panel}>
      <StorageSelector
        options={storageOptions}
        selected={selectedStorage}
        onSelect={onSelectStorage}
      />
      <ColorSelector colors={colors} selected={selectedColor} onSelect={onSelectColor} />
    </div>
  );
}
