import { ResultsCount } from "./ResultsCount";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ResultsCount> = {
  title: "Listing/ResultsCount",
  component: ResultsCount,
  argTypes: {
    count: { control: { type: "number", min: 0 } },
    isLoading: { control: "boolean" },
  },
  args: { count: 20, isLoading: false },
};

export default meta;

export const Playground: StoryObj<typeof ResultsCount> = {};
