import { buildSearchTree } from "@/lib/search";
import { products } from "@mocks/fixtures";

import { PhoneListing } from "./PhoneListing";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const catalog = products.slice(0, 6);

const meta: Meta<typeof PhoneListing> = {
  title: "Listing/PhoneListing",
  component: PhoneListing,
  argTypes: {
    catalog: { control: "object" },
    searchTree: { control: false },
    initialCount: { control: "number" },
  },
  args: { catalog, searchTree: buildSearchTree(catalog) },
};

export default meta;

export const Playground: StoryObj<typeof PhoneListing> = {};
