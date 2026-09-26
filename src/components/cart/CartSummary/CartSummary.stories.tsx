import { fn } from "storybook/test";

import { CartSummary } from "./CartSummary";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof CartSummary> = {
  title: "Cart/CartSummary",
  component: CartSummary,
  argTypes: {
    totalPrice: { control: { type: "number", min: 0 } },
  },
  args: { totalPrice: 2818, onPay: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof CartSummary> = {};
