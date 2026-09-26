import { Price } from "./Price";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Price> = {
  title: "Primitives/Price",
  component: Price,
  argTypes: {
    value: { control: { type: "number", min: 0 } },
    currency: { control: "text" },
  },
  args: { value: 1329, currency: "EUR" },
};

export default meta;

export const Playground: StoryObj<typeof Price> = {};
