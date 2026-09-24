import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PhoneHero } from "./PhoneHero";

const meta: Meta<typeof PhoneHero> = {
  title: "Detail/PhoneHero",
  component: PhoneHero,
  args: {
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
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
