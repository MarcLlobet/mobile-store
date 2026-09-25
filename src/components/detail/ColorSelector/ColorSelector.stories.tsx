import { useState } from "react";

import type { ColorOption } from "@/lib/api/types";

import { ColorSelector } from "./ColorSelector";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors: ColorOption[] = [
  { name: "Black", hexCode: "#1c1c1e", imageUrl: "" },
  { name: "Blue", hexCode: "#3b5f8a", imageUrl: "" },
  { name: "Gold", hexCode: "#d4af7a", imageUrl: "" },
];

const meta: Meta<typeof ColorSelector> = {
  title: "Detail/ColorSelector",
  component: ColorSelector,
  args: { colors },
};

export default meta;
type Story = StoryObj<typeof ColorSelector>;

export const NoneSelected: Story = {
  args: { selected: null },
};

export const OneSelected: Story = {
  args: { selected: colors[1] },
};

export const Interactive: Story = {
  render: (args) => {
    const Wrapper = () => {
      const [selected, setSelected] = useState<ColorOption | null>(null);
      return <ColorSelector {...args} selected={selected} onSelect={setSelected} />;
    };
    return <Wrapper />;
  },
};
