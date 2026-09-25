import { CartSummary } from "./CartSummary";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof CartSummary> = {
  title: "Cart/CartSummary",
  component: CartSummary,
  args: { totalPrice: 2818 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartSummary>;

export const Default: Story = {};

export const SmallTotal: Story = {
  args: { totalPrice: 349 },
};
