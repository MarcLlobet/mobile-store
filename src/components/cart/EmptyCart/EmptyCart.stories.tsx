import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyCart } from "./EmptyCart";

/**
 * Self-contained — no props, no `useCart()` call. Navigation uses
 * `next/navigation`'s `useRouter`, which `@storybook/nextjs-vite` mocks
 * automatically, so no `CartProvider` decorator is needed.
 */
const meta: Meta<typeof EmptyCart> = {
  title: "Cart/EmptyCart",
  component: EmptyCart,
};

export default meta;
type Story = StoryObj<typeof EmptyCart>;

export const Default: Story = {};
