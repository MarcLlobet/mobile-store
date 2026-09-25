import { PhoneHero } from "./PhoneHero";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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

export const MultipleColorVariants: Story = {
  args: {
    variants: [
      { key: "Black", imageUrl: BLACK },
      { key: "Blue", imageUrl: BLUE },
    ],
    activeKey: "Blue",
  },
};

export const SharedPhotoAcrossColors: Story = {
  args: {
    variants: [
      { key: "Graphite", imageUrl: BLACK },
      { key: "Space Black", imageUrl: BLACK },
    ],
    activeKey: "Space Black",
  },
};
