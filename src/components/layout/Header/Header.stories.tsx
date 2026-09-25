import { CartProvider } from "@/context/CartContext";

import { Header } from "./Header";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
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
