import { useState } from "react";

import type { StorageOption } from "@/lib/api/types";

import { StorageSelector } from "./StorageSelector";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const options: StorageOption[] = [
  { capacity: "256GB", price: 1319 },
  { capacity: "512GB", price: 1449 },
  { capacity: "1TB", price: 1699 },
];

const meta: Meta<typeof StorageSelector> = {
  title: "Detail/StorageSelector",
  component: StorageSelector,
  args: { options },
};

export default meta;
type Story = StoryObj<typeof StorageSelector>;

export const NoneSelected: Story = {
  args: { selected: null },
};

export const OneSelected: Story = {
  args: { selected: options[1] },
};

export const Interactive: Story = {
  render: (args) => {
    const Wrapper = () => {
      const [selected, setSelected] = useState<StorageOption | null>(null);
      return <StorageSelector {...args} selected={selected} onSelect={setSelected} />;
    };
    return <Wrapper />;
  },
};
