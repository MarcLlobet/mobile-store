import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartItem } from "./CartItem";

/**
 * `CartItem` is purely prop-driven (no `useCart()` call inside it), so it
 * renders standalone here with no `CartProvider` decorator — proof that the
 * component is agnostic to where its data comes from.
 */
const meta: Meta<typeof CartItem> = {
  title: "Cart/CartItem",
  component: CartItem,
  args: {
    item: {
      cartItemId: "APL-IP15PM-Space Black-256GB",
      productId: "APL-IP15PM",
      name: "iPhone 15 Pro Max",
      brand: "Apple",
      imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
      color: "Space Black",
      storage: "256GB",
      unitPrice: 1319,
    },
  },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: "none", maxWidth: 480, margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartItem>;

export const Default: Story = {};

export const LongName: Story = {
  args: {
    item: {
      cartItemId: "SAM-GS24U-Titanium Grey-1TB",
      productId: "SAM-GS24U",
      name: "Samsung Galaxy S24 Ultra with S Pen and Extra Long Product Name",
      brand: "Samsung",
      imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-gs24u.png",
      color: "Titanium Grey",
      storage: "1TB",
      unitPrice: 1799,
    },
  },
};
