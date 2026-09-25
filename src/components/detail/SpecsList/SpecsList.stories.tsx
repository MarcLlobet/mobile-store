import { SpecsList } from "./SpecsList";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SpecsList> = {
  title: "Detail/SpecsList",
  component: SpecsList,
  args: {
    brand: "Apple",
    name: "iPhone 15 Pro",
    description: "The latest iPhone, with a titanium design and the A17 Pro chip.",
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
  },
};

export default meta;
type Story = StoryObj<typeof SpecsList>;

export const Default: Story = {};
