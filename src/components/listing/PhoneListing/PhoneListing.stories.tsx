import { products } from "@mocks/fixtures";

import { PhoneListing } from "./PhoneListing";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof PhoneListing> = {
  title: "Listing/PhoneListing",
  component: PhoneListing,
  argTypes: {
    initialProducts: { control: "object" },
  },
  args: { initialProducts: products.slice(0, 6) },
};

export default meta;

export const Playground: StoryObj<typeof PhoneListing> = {};
