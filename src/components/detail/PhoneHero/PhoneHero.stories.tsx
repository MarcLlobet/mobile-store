import { normalizeProductDetail } from "@/lib/api/transform";
import { productDetail } from "@mocks/fixtures";

import { PhoneHero } from "./PhoneHero";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const variants = normalizeProductDetail(productDetail).colorOptions.map((color) => ({
  key: color.name,
  imageUrl: color.imageUrl,
}));

const meta: Meta<typeof PhoneHero> = {
  title: "Detail/PhoneHero",
  component: PhoneHero,
  argTypes: {
    variants: { control: "object" },
    activeKey: { control: "select", options: variants.map((variant) => variant.key) },
    name: { control: "text" },
  },
  args: { variants, activeKey: variants[0]?.key ?? "", name: productDetail.name },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof PhoneHero> = {};
