import { CartProvider } from "@/context/CartContext";
import { productDetail } from "@mocks/fixtures";

import { AddToCartButton } from "./AddToCartButton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = productDetail.colorOptions;
const storageOptions = productDetail.storageOptions;

const meta: Meta<typeof AddToCartButton> = {
  title: "Detail/AddToCartButton",
  component: AddToCartButton,
  argTypes: {
    productId: { control: "text" },
    brand: { control: "text" },
    name: { control: "text" },
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
    productId: productDetail.id,
    brand: productDetail.brand,
    name: productDetail.name,
    selectedColor: null,
    selectedStorage: null,
  },
  decorators: [
    (Story) => (
      <CartProvider>
        <Story />
      </CartProvider>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof AddToCartButton> = {};
