import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SimilarProducts } from "./SimilarProducts";

const products = [
  {
    id: "APL-IP15",
    name: "iPhone 15",
    brand: "Apple",
    basePrice: 949,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15.png",
  },
  {
    id: "APL-IP15P",
    name: "iPhone 15 Pro",
    brand: "Apple",
    basePrice: 1219,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15p.png",
  },
  {
    id: "SAM-S24U",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    basePrice: 1449,
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-s24u.png",
  },
];

const meta: Meta<typeof SimilarProducts> = {
  title: "Detail/SimilarProducts",
  component: SimilarProducts,
  args: { products },
};

export default meta;
type Story = StoryObj<typeof SimilarProducts>;

export const Default: Story = {};

export const Empty: Story = {
  args: { products: [] },
};
