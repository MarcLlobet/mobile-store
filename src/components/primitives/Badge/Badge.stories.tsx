import { Badge } from "./Badge";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  args: { count: 3 },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const WithCount: Story = {};

export const Zero: Story = {
  args: { count: 0 },
  parameters: {
    docs: {
      description: { story: "Renders nothing when count is 0 — no empty pill in the header." },
    },
  },
};
