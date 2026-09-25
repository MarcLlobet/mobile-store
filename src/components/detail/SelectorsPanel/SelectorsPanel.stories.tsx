import { useState } from "react";

import type { ColorOption, StorageOption } from "@/lib/api/types";

import { SelectorsPanel } from "./SelectorsPanel";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors: ColorOption[] = [
  { name: "Black", hexCode: "#1c1c1e", imageUrl: "" },
  { name: "Blue", hexCode: "#3b5f8a", imageUrl: "" },
];

const storageOptions: StorageOption[] = [
  { capacity: "256GB", price: 1319 },
  { capacity: "512GB", price: 1449 },
];

const meta: Meta<typeof SelectorsPanel> = {
  title: "Detail/SelectorsPanel",
  component: SelectorsPanel,
};

export default meta;
type Story = StoryObj<typeof SelectorsPanel>;

export const Interactive: Story = {
  render: () => {
    const Wrapper = () => {
      const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
      const [selectedStorage, setSelectedStorage] = useState<StorageOption | null>(null);
      return (
        <SelectorsPanel
          colors={colors}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          storageOptions={storageOptions}
          selectedStorage={selectedStorage}
          onSelectStorage={setSelectedStorage}
        />
      );
    };
    return <Wrapper />;
  },
};
