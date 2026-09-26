import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { productDetail } from "@mocks/fixtures";

import { SelectorsPanel } from "./SelectorsPanel";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = productDetail.colorOptions;
const storageOptions = productDetail.storageOptions;

const meta: Meta<typeof SelectorsPanel> = {
  title: "Detail/SelectorsPanel",
  component: SelectorsPanel,
  argTypes: {
    colors: { control: "object" },
    storageOptions: { control: "object" },
    selectedColor: {
      control: "select",
      options: ["none", ...colors.map((color) => color.name)],
      mapping: { none: null, ...Object.fromEntries(colors.map((c) => [c.name, c])) },
    },
    selectedStorage: {
      control: "select",
      options: ["none", ...storageOptions.map((option) => option.capacity)],
      mapping: { none: null, ...Object.fromEntries(storageOptions.map((o) => [o.capacity, o])) },
    },
  },
  args: {
    colors,
    storageOptions,
    selectedColor: null,
    selectedStorage: null,
    onSelectColor: fn(),
    onSelectStorage: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <SelectorsPanel
        {...args}
        onSelectColor={(color) => {
          updateArgs({ selectedColor: color.name });
          args.onSelectColor(color);
        }}
        onSelectStorage={(option) => {
          updateArgs({ selectedStorage: option.capacity });
          args.onSelectStorage(option);
        }}
      />
    );
  },
};

export default meta;

export const Playground: StoryObj<typeof SelectorsPanel> = {};
