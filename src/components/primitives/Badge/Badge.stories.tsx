import { Badge } from "./Badge";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  argTypes: {
    count: { control: { type: "number", min: 0 } },
  },
  args: { count: 3 },
};

export default meta;

export const Playground: StoryObj<typeof Badge> = {};
