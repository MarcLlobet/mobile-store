import { productDetail } from "@mocks/fixtures";

import { SpecsList } from "./SpecsList";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SpecsList> = {
  title: "Detail/SpecsList",
  component: SpecsList,
  argTypes: {
    brand: { control: "text" },
    name: { control: "text" },
    description: { control: "text" },
    specs: { control: "object" },
  },
  args: {
    brand: productDetail.brand,
    name: productDetail.name,
    description: productDetail.description,
    specs: productDetail.specs,
  },
};

export default meta;

export const Playground: StoryObj<typeof SpecsList> = {};
