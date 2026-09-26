import { CART_STORAGE_KEY, CartProvider } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";
import { productDetail } from "@mocks/fixtures";

import { Header } from "./Header";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

interface HeaderStoryArgs {
  cartItemCount: number;
}

const firstColor = productDetail.colorOptions[0];
const firstStorage = productDetail.storageOptions[0];

const variant = {
  imageUrl: firstColor?.imageUrl ?? "",
  color: firstColor?.name ?? "",
  storage: firstStorage?.capacity ?? "",
  unitPrice: firstStorage?.price ?? 0,
};

const lineAt = (index: number): CartItem => ({
  cartItemId: `line-${String(index)}`,
  productId: productDetail.id,
  name: productDetail.name,
  brand: productDetail.brand,
  ...variant,
});

const meta: Meta<HeaderStoryArgs> = {
  title: "Layout/Header",
  component: Header,
  argTypes: {
    cartItemCount: { control: { type: "range", min: 0, max: 9, step: 1 } },
  },
  args: { cartItemCount: 0 },
  render: () => <Header />,
  decorators: [
    (Story, { args }) => {
      const lines = Array.from({ length: args.cartItemCount }, (_unused, index) => lineAt(index));
      globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
      return (
        <CartProvider key={args.cartItemCount}>
          <Story />
        </CartProvider>
      );
    },
  ],
};

export default meta;

export const Playground: StoryObj<HeaderStoryArgs> = {};
