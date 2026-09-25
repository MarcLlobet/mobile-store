import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PhoneDetailLayout from "@/app/phones/[id]/layout";
import { CartProvider } from "@/context/CartContext";
import type { ProductDetail } from "@/lib/api/types";
import { PhoneDetailView } from "./PhoneDetailView";

const product: ProductDetail = {
  id: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  basePrice: 1319,
  description: "The latest iPhone, with a titanium design and the A17 Pro chip.",
  rating: 4.8,
  specs: {
    screen: "6.7 inch OLED",
    resolution: "2796 x 1290",
    processor: "A17 Pro",
    mainCamera: "48MP",
    selfieCamera: "12MP",
    battery: "4441 mAh",
    os: "iOS 17",
    screenRefreshRate: "120Hz",
  },
  colorOptions: [
    {
      name: "Black Titanium",
      hexCode: "#3b3b3b",
      imageUrl:
        "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm-black.png",
    },
    {
      name: "Blue Titanium",
      hexCode: "#3b5f8a",
      imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm-blue.png",
    },
  ],
  storageOptions: [
    { capacity: "256GB", price: 1319 },
    { capacity: "512GB", price: 1449 },
    { capacity: "1TB", price: 1699 },
  ],
  similarProducts: [
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
  ],
};

const meta: Meta<typeof PhoneDetailView> = {
  title: "Detail/PhoneDetailView",
  component: PhoneDetailView,
  args: { product },
  // PhoneDetailView renders AddToCartButton, which calls useCart()
  // internally — every story must supply a CartProvider explicitly. The
  // real route layout supplies the <main> box and the BackButton that the
  // component no longer renders itself, so stories mount it too.
  decorators: [
    (Story) => (
      <CartProvider>
        <PhoneDetailLayout>
          <Story />
        </PhoneDetailLayout>
      </CartProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PhoneDetailView>;

export const Default: Story = {};

export const NoSimilarProducts: Story = {
  args: { product: { ...product, similarProducts: [] } },
};
