import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartList } from "./CartList";

/**
 * Prop-driven — no `useCart()` call inside it, so no `CartProvider`
 * decorator is needed here.
 */
const meta: Meta<typeof CartList> = {
  title: "Cart/CartList",
  component: CartList,
  args: {
    items: [
      {
        cartItemId: "APL-IP15PM-Space Black-256GB",
        productId: "APL-IP15PM",
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
        color: "Space Black",
        storage: "256GB",
        unitPrice: 1319,
      },
      {
        cartItemId: "SAM-GS24U-Titanium Grey-512GB",
        productId: "SAM-GS24U",
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-gs24u.png",
        color: "Titanium Grey",
        storage: "512GB",
        unitPrice: 1499,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartList>;

export const Default: Story = {};

export const SingleItem: Story = {
  args: {
    items: [
      {
        cartItemId: "APL-IP15PM-Space Black-256GB",
        productId: "APL-IP15PM",
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
        color: "Space Black",
        storage: "256GB",
        unitPrice: 1319,
      },
    ],
  },
};
