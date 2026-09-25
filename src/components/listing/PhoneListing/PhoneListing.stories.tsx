import { type Decorator, type Meta, type StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";

import { LISTING_LIMIT, listingQuery } from "@/lib/api/queries";
import type { ProductListItem } from "@/lib/api/types";
import { makeQueryClient } from "@/lib/query";

import { PhoneListing } from "./PhoneListing";

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
];

const withSeededListing = (seed: ProductListItem[]): Decorator =>
  function SeededListing(Story) {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(listingQuery().queryKey, seed);
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof PhoneListing> = {
  title: "Listing/PhoneListing",
  component: PhoneListing,
  parameters: {
    docs: {
      description: {
        component: `Client orchestrator for the listing view. Renders the ${LISTING_LIMIT}-item page React Query holds for \`search=""\`; typing in the search box swaps to a new query key, which triggers a debounced, API-side search (not exercised in these static stories).`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneListing>;

export const Default: Story = {
  decorators: [withSeededListing(products)],
};

export const Empty: Story = {
  decorators: [withSeededListing([])],
};
