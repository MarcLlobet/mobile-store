import type { ComponentProps } from "react";

import { fn } from "storybook/test";

import { productDetail } from "@mocks/fixtures";

import { PreviewState, type PreviewStateName } from "../../../../.storybook/PreviewState";

import { CartItem } from "./CartItem";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type CartItemStoryArgs = ComponentProps<typeof CartItem> & { previewState: PreviewStateName };

const firstColor = productDetail.colorOptions[0];
const firstStorage = productDetail.storageOptions[0];

const meta: Meta<CartItemStoryArgs> = {
  title: "Cart/CartItem",
  component: CartItem,
  argTypes: {
    item: { control: "object" },
    previewState: { control: "inline-radio", options: ["default", "hover"] },
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
    previewState: "default",
  },
  render: ({ previewState, ...args }) => (
    <PreviewState state={previewState} selector="button">
      <CartItem {...args} />
    </PreviewState>
  ),
  decorators: [
    (Story) => (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<CartItemStoryArgs> = {};
