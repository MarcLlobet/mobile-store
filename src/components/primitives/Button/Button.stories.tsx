import { fn } from "storybook/test";

import { Button } from "./Button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Add to cart",
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Standard: Story = {
  args: { variant: "standard" },
};

export const PrimaryDisabled: Story = {
  args: { variant: "primary", disabled: true },
};

export const StandardDisabled: Story = {
  args: { variant: "standard", disabled: true },
};
