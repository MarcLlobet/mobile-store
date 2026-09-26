import { EmptyState } from "./EmptyState";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof EmptyState> = {
  title: "Listing/EmptyState",
  component: EmptyState,
  argTypes: {
    query: { control: "text" },
  },
  args: { query: "nokia" },
};

export default meta;

export const Playground: StoryObj<typeof EmptyState> = {};
