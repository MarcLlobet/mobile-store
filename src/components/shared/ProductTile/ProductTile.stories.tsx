import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProductTile } from "./ProductTile";

const meta: Meta<typeof ProductTile> = {
  title: "Shared/ProductTile",
  component: ProductTile,
  args: {
    id: "APL-IP15PM",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    basePrice: 1319,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 260 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductTile>;

export const Default: Story = {};
