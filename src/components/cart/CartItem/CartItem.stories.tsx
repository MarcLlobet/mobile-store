import { fn } from "storybook/test";

import { productDetail } from "@mocks/fixtures";

import { CartItem } from "./CartItem";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const firstColor = productDetail.colorOptions[0];
const firstStorage = productDetail.storageOptions[0];

const meta: Meta<typeof CartItem> = {
  title: "Cart/CartItem",
  component: CartItem,
  argTypes: {
    item: { control: "object" },
  },
  args: {
    item: {
      cartItemId: "line-1",
      productId: productDetail.id,
      name: productDetail.name,
      brand: productDetail.brand,
      imageUrl: firstColor?.imageUrl ?? "",
      color: firstColor?.name ?? "",
      storage: firstStorage?.capacity ?? "",
      unitPrice: firstStorage?.price ?? productDetail.basePrice,
    },
    onRemove: fn(),
  },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof CartItem> = {};
