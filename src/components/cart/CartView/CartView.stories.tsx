import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import type { CartItem } from "@/types/cart";
import { productDetail } from "@mocks/fixtures";

import { CartView } from "./CartView";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const storage = productDetail.storageOptions[0];

const lines: CartItem[] = productDetail.colorOptions.map((color, index) => ({
  cartItemId: `line-${String(index)}`,
  productId: productDetail.id,
  name: productDetail.name,
  brand: productDetail.brand,
  imageUrl: color.imageUrl,
  color: color.name,
  storage: storage?.capacity ?? "",
  unitPrice: storage?.price ?? productDetail.basePrice,
}));

const meta: Meta<typeof CartView> = {
  title: "Cart/CartView",
  component: CartView,
  parameters: { layout: "fullscreen" },
  argTypes: {
    items: { control: "object" },
    totalPrice: { table: { disable: true } },
    onRemove: { table: { disable: true } },
  },
  args: { items: lines.slice(0, 2), totalPrice: 0, onRemove: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs<{ items: readonly CartItem[] }>();

    return (
      <CartView
        items={args.items}
        totalPrice={args.items.reduce((sum, item) => sum + item.unitPrice, 0)}
        onRemove={(cartItemId) => {
          updateArgs({ items: args.items.filter((item) => item.cartItemId !== cartItemId) });
          args.onRemove(cartItemId);
        }}
      />
    );
  },
};

export default meta;

export const Playground: StoryObj<typeof CartView> = {};

export const Empty: StoryObj<typeof CartView> = { args: { items: [] } };
