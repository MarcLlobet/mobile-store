import { productDetail } from "@mocks/fixtures";

import { SimilarProducts } from "./SimilarProducts";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SimilarProducts> = {
  title: "Detail/SimilarProducts",
  component: SimilarProducts,
  argTypes: {
    products: { control: "object" },
  },
  args: { products: productDetail.similarProducts },
};

export default meta;

export const Playground: StoryObj<typeof SimilarProducts> = {};
