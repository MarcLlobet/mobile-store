import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartSummary } from "./CartSummary";

/**
 * Prop-driven — `totalPrice` is the only cart data it needs, passed straight
 * in as an arg. It navigates via `next/navigation`'s `useRouter`, which
 * `@storybook/nextjs-vite` mocks automatically, so no extra decorator is
 * needed (and, per the brief, none for `CartProvider` either).
 */
const meta: Meta<typeof CartSummary> = {
  title: "Cart/CartSummary",
  component: CartSummary,
  args: { totalPrice: 2818 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartSummary>;

export const Default: Story = {};

export const SmallTotal: Story = {
  args: { totalPrice: 349 },
};
