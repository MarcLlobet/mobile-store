import PhoneDetailLayout from "@/app/phones/[id]/layout";
import { CartProvider } from "@/context/CartContext";
import { normalizeProductDetail } from "@/lib/api/transform";
import { productDetail } from "@mocks/fixtures";

import { PhoneDetailView } from "./PhoneDetailView";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const product = normalizeProductDetail(productDetail);

const meta: Meta<typeof PhoneDetailView> = {
  title: "Detail/PhoneDetailView",
  component: PhoneDetailView,
  argTypes: {
    product: { control: "object" },
  },
  args: { product },
  decorators: [
    (Story) => (
      <CartProvider>
        <PhoneDetailLayout>
          <Story />
        </PhoneDetailLayout>
      </CartProvider>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof PhoneDetailView> = {};
