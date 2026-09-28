import { BagIcon } from "./BagIcon";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof BagIcon> = {
  title: "Primitives/BagIcon",
  component: BagIcon,
  argTypes: {
    filled: { control: "boolean" },
    size: { control: { type: "range", min: 16, max: 160, step: 4 } },
    className: { table: { disable: true } },
  },
  args: { filled: false, size: 96 },
};

export default meta;

export const Playground: StoryObj<typeof BagIcon> = {};
