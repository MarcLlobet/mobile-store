import { EmptyState } from "./EmptyState";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof EmptyState> = {
  title: "Listing/EmptyState",
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoQuery: Story = {};

export const WithQuery: Story = {
  args: { query: "zzzz" },
};
