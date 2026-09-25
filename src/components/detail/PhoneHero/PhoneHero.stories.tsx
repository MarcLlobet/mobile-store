import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PhoneHero } from "./PhoneHero";

const BLACK = "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm-black.png";
const BLUE = "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm-blue.png";

const meta: Meta<typeof PhoneHero> = {
  title: "Detail/PhoneHero",
  component: PhoneHero,
  args: {
    variants: [{ key: "Black", imageUrl: BLACK }],
    activeKey: "Black",
    name: "iPhone 15 Pro Max",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PhoneHero>;

export const Default: Story = {};

/**
 * Both variants are in the DOM and already fetched and decoded; only
 * `activeKey` decides which one is opaque. Flipping the control swaps the
 * image with no network activity — this is what makes the Detail view's
 * hover preview instant.
 */
export const MultipleColorVariants: Story = {
  args: {
    variants: [
      { key: "Black", imageUrl: BLACK },
      { key: "Blue", imageUrl: BLUE },
    ],
    activeKey: "Blue",
  },
};

/**
 * Two differently-named colors sharing one photo — a real shape from this
 * API. Both stay individually addressable by `activeKey`.
 */
export const SharedPhotoAcrossColors: Story = {
  args: {
    variants: [
      { key: "Graphite", imageUrl: BLACK },
      { key: "Space Black", imageUrl: BLACK },
    ],
    activeKey: "Space Black",
  },
};
