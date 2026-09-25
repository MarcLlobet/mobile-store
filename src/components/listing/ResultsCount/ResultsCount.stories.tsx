import { ResultsCount } from "./ResultsCount";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ResultsCount> = {
  title: "Listing/ResultsCount",
  component: ResultsCount,
  args: {
    count: 24,
  },
};

export default meta;
type Story = StoryObj<typeof ResultsCount>;

export const ManyResults: Story = {};

export const SingleResult: Story = {
  args: { count: 1 },
};

export const NoResults: Story = {
  args: { count: 0 },
};

export const Loading: Story = {
  args: { count: 0, isLoading: true },
};
