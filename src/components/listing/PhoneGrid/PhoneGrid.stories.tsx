import type { ProductListItem } from "@/lib/api/types";

import { PhoneGrid } from "./PhoneGrid";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const products: ProductListItem[] = [
  {
    id: "APL-IP15PM",
    brand: "Apple",
    name: "iPhone 15 Pro Max",
    basePrice: 1319,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
  },
  {
    id: "SAM-GS24",
    brand: "Samsung",
    name: "Galaxy S24",
    basePrice: 899,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-gs24.png",
  },
  {
    id: "XMI-RN13P5G",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro 5G",
    basePrice: 299,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/xmi-rn13p5g.png",
  },
  {
    id: "XMI-RN13P5G",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro 5G",
    basePrice: 299,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/xmi-rn13p5g.png",
  },
];

const meta: Meta<typeof PhoneGrid> = {
  title: "Listing/PhoneGrid",
  component: PhoneGrid,
  args: {
    products,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneGrid>;

export const Default: Story = {};

export const Empty: Story = {
  args: { products: [] },
};
