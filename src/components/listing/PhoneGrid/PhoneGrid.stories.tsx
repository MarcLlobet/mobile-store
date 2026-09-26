import { products } from "@mocks/fixtures";

import { PhoneGrid } from "./PhoneGrid";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof PhoneGrid> = {
  title: "Listing/PhoneGrid",
  component: PhoneGrid,
  argTypes: {
    products: { control: "object" },
  },
  args: { products: products.slice(0, 6) },
};

export default meta;

export const Playground: StoryObj<typeof PhoneGrid> = {};
