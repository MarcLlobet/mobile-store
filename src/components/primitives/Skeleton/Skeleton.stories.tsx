import { Skeleton } from "./Skeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  argTypes: {
    className: { table: { disable: true } },
    width: { control: "text" },
    height: { control: "text" },
    radius: { control: "text" },
    ariaLabel: { control: "text" },
  },
  args: { width: "100%", height: 16, radius: 0, ariaLabel: undefined },
};

export default meta;

export const Playground: StoryObj<typeof Skeleton> = {};
