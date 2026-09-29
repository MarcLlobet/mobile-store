import { products } from "@mocks/fixtures";

import { ProductTile } from "./ProductTile";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const sample = products[0];

const meta: Meta<typeof ProductTile> = {
  title: "Shared/ProductTile",
  component: ProductTile,
  argTypes: {
    id: { control: "text" },
    brand: { control: "text" },
    name: { control: "text" },
    basePrice: { control: { type: "number", min: 0 } },
    imageUrl: { control: "text" },
    isFirstImages: { control: "boolean" },
  },
  args: { ...sample, isFirstImages: false },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 344 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof ProductTile> = {};
