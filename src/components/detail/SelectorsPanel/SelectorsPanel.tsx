import { ColorSelector } from "@/components/detail/ColorSelector";
import { StorageSelector } from "@/components/detail/StorageSelector";
import type { ColorOption, StorageOption } from "@/lib/api/types";

import styles from "./SelectorsPanel.module.css";

export interface SelectorsPanelProps {
  colors: readonly ColorOption[];
  selectedColor: ColorOption | null;
  onSelectColor: (color: ColorOption) => void;
  storageOptions: readonly StorageOption[];
  selectedStorage: StorageOption | null;
  onSelectStorage: (option: StorageOption) => void;
}

export const SelectorsPanel = ({
  colors,
  selectedColor,
  onSelectColor,
  storageOptions,
  selectedStorage,
  onSelectStorage,
}: SelectorsPanelProps) => (
  <div className={styles.panel}>
    <StorageSelector
      options={storageOptions}
      selected={selectedStorage}
      onSelect={onSelectStorage}
    />
    <ColorSelector colors={colors} selected={selectedColor} onSelect={onSelectColor} />
  </div>
);
