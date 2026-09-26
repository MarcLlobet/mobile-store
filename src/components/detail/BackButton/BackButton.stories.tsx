import { BackButton } from "./BackButton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof BackButton> = {
  title: "Detail/BackButton",
  component: BackButton,
  argTypes: {
    href: { control: "text" },
  },
  args: { href: "/" },
};

export default meta;

export const Playground: StoryObj<typeof BackButton> = {};
