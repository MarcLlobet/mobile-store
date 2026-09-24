import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ProductListItem } from "@/lib/api/types";
import { PhoneListing } from "./PhoneListing";

const initialProducts: ProductListItem[] = [
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
];

const meta: Meta<typeof PhoneListing> = {
  title: "Listing/PhoneListing",
  component: PhoneListing,
  args: {
    initialProducts,
  },
  parameters: {
    // This story never types into the search box, so the component never
    // calls fetchProducts - it only ever renders the initial, SSG-shaped
    // props. Documents the "no fetch on mount" contract visually.
    docs: {
      description: {
        component:
          "Client orchestrator for the listing view. Renders the server-provided initial products as-is; typing in the search box triggers a debounced, API-based re-fetch (not exercised in this static story).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneListing>;

export const Default: Story = {};

export const Empty: Story = {
  args: { initialProducts: [] },
};
