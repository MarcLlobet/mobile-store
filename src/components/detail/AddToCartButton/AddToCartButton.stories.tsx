import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartProvider } from "@/context/CartContext";
import { AddToCartButton } from "./AddToCartButton";

const color = { name: "Black", hexCode: "#000000", imageUrl: "https://example.com/black.png" };
const storage = { capacity: "256GB", price: 1319 };

const meta: Meta<typeof AddToCartButton> = {
  title: "Detail/AddToCartButton",
  component: AddToCartButton,
  args: {
    productId: "APL-IP15PM",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
  },
  // AddToCartButton calls useCart() internally (frozen contract), so every
  // story must supply a CartProvider explicitly — the "prove the dependency
  // is explicit, not ambient" decorator check from the plan.
  decorators: [
    (Story) => (
      <CartProvider>
        <Story />
      </CartProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AddToCartButton>;

export const Disabled: Story = {
  args: { selectedColor: null, selectedStorage: null },
};

export const ColorOnlySelected: Story = {
  args: { selectedColor: color, selectedStorage: null },
};

export const Enabled: Story = {
  args: { selectedColor: color, selectedStorage: storage },
};
