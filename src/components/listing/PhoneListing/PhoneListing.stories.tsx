import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ProductListItem } from "@/lib/api/types";
import { LISTING_LIMIT, listingQuery } from "@/lib/api/queries";
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

/**
 * PhoneListing takes no props — it reads the catalog from React Query. In the
 * app that cache arrives hydrated from the build-time prefetch (app/page.tsx);
 * here each story seeds the same query key directly, which is why the story
 * renders without ever reaching the network. Typing in the search box *would*
 * fire a real request, so these stories are static by design.
 */
function withSeededListing(seed: ProductListItem[]): Decorator {
  return function SeededListing(Story) {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(listingQuery().queryKey, seed);
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  };
}

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
