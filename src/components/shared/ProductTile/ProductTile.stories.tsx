import type { ComponentProps } from "react";

import { products } from "@mocks/fixtures";

import { PreviewState, type PreviewStateName } from "../../../../.storybook/PreviewState";

import { ProductTile } from "./ProductTile";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const sample = products[0];

type ProductTileStoryArgs = ComponentProps<typeof ProductTile> & {
  previewState: PreviewStateName;
};

const meta: Meta<ProductTileStoryArgs> = {
  title: "Shared/ProductTile",
  component: ProductTile,
  argTypes: {
    id: { control: "text" },
    brand: { control: "text" },
    name: { control: "text" },
    basePrice: { control: { type: "number", min: 0 } },
    imageUrl: { control: "text" },
    previewState: { control: "inline-radio", options: ["default", "hover"] },
  },
  args: { ...sample, previewState: "default" },
  render: ({ previewState, ...args }) => (
    <PreviewState state={previewState}>
      <ProductTile {...args} />
    </PreviewState>
  ),
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 344 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<ProductTileStoryArgs> = {};
