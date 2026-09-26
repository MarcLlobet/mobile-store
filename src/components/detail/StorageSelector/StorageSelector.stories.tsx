import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { productDetail } from "@mocks/fixtures";

import { StorageSelector } from "./StorageSelector";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const options = productDetail.storageOptions;

const meta: Meta<typeof StorageSelector> = {
  title: "Detail/StorageSelector",
  component: StorageSelector,
  argTypes: {
    options: { control: "object" },
    selected: {
      control: "select",
      options: ["none", ...options.map((option) => option.capacity)],
      mapping: {
        none: null,
        ...Object.fromEntries(options.map((option) => [option.capacity, option])),
      },
    },
  },
  args: { options, selected: null, onSelect: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <StorageSelector
        {...args}
        onSelect={(option) => {
          updateArgs({ selected: option.capacity });
          args.onSelect(option);
        }}
      />
    );
  },
};

export default meta;

export const Playground: StoryObj<typeof StorageSelector> = {};
