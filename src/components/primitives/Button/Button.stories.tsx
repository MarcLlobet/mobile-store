import { fn } from "storybook/test";

import { Button } from "./Button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "standard"] },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    disabled: { control: "boolean" },
    children: { control: "text" },
    ariaLabel: { control: "text" },
  },
  args: {
    variant: "primary",
    type: "button",
    disabled: false,
    children: "Add to cart",
    ariaLabel: undefined,
    onClick: fn(),
  },
};

export default meta;

export const Playground: StoryObj<typeof Button> = {};
