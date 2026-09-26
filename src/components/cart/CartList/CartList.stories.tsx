import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import type { CartItem } from "@/types/cart";
import { productDetail } from "@mocks/fixtures";

import { CartList } from "./CartList";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const lines: CartItem[] = productDetail.storageOptions.map((storage, index) => ({
  cartItemId: `line-${String(index)}`,
  productId: productDetail.id,
  name: productDetail.name,
  brand: productDetail.brand,
  imageUrl: productDetail.colorOptions[index]?.imageUrl ?? "",
  color: productDetail.colorOptions[index]?.name ?? "",
  storage: storage.capacity,
  unitPrice: storage.price,
}));

const meta: Meta<typeof CartList> = {
  title: "Cart/CartList",
  component: CartList,
  argTypes: {
    items: { control: "object" },
  },
  args: { items: lines, onRemove: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <CartList
        {...args}
        onRemove={(cartItemId) => {
          updateArgs({ items: args.items.filter((item) => item.cartItemId !== cartItemId) });
          args.onRemove(cartItemId);
        }}
      />
    );
  },
};

export default meta;

export const Playground: StoryObj<typeof CartList> = {};
