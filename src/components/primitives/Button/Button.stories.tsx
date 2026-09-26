import type { ComponentProps } from "react";

import { fn } from "storybook/test";

import {
  PREVIEW_STATES,
  PreviewState,
  type PreviewStateName,
} from "../../../../.storybook/PreviewState";

import { Button } from "./Button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type ButtonStoryArgs = ComponentProps<typeof Button> & { previewState: PreviewStateName };

const meta: Meta<ButtonStoryArgs> = {
  title: "Primitives/Button",
  component: Button,
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "standard"] },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    disabled: { control: "boolean" },
    previewState: { control: "inline-radio", options: PREVIEW_STATES },
    children: { control: "text" },
    ariaLabel: { control: "text" },
  },
  args: {
    variant: "primary",
    type: "button",
    disabled: false,
    previewState: "default",
    children: "Add to cart",
    ariaLabel: undefined,
    onClick: fn(),
  },
  render: ({ previewState, ...args }) => (
    <PreviewState state={previewState}>
      <Button {...args} />
    </PreviewState>
  ),
};

export default meta;

export const Playground: StoryObj<ButtonStoryArgs> = {};
