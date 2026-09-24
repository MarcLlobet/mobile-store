import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartProvider } from "@/context/CartContext";
import { Header } from "./Header";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  // Header calls useCart() internally (frozen contract: it takes no props),
  // so every story must supply a CartProvider explicitly — this is exactly
  // the "make ambient app-state dependencies explicit via a decorator"
  // rule from the plan.
  decorators: [
    (Story) => (
      <CartProvider>
        <Story />
      </CartProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
