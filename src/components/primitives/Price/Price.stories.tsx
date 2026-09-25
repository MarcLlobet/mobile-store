import { Price } from "./Price";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Price> = {
  title: "Primitives/Price",
  component: Price,
  args: { value: 1319 },
};

export default meta;
type Story = StoryObj<typeof Price>;

export const Default: Story = {};

export const InUSD: Story = {
  args: { value: 999, currency: "USD" },
};
