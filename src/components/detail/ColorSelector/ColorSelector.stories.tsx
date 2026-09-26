import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { productDetail } from "@mocks/fixtures";

import { ColorSelector } from "./ColorSelector";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = productDetail.colorOptions;

const meta: Meta<typeof ColorSelector> = {
  title: "Detail/ColorSelector",
  component: ColorSelector,
  argTypes: {
    colors: { control: "object" },
    selected: {
      control: "select",
      options: ["none", ...colors.map((color) => color.name)],
      mapping: {
        none: null,
        ...Object.fromEntries(colors.map((color) => [color.name, color])),
      },
    },
  },
  args: {
    colors,
    selected: null,
    onSelect: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <ColorSelector
        {...args}
        onSelect={(color) => {
          updateArgs({ selected: color.name });
          args.onSelect(color);
        }}
      />
    );
  },
};

export default meta;

export const Playground: StoryObj<typeof ColorSelector> = {};
