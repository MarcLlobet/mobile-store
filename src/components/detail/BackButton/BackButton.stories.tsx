import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BackButton } from "./BackButton";

const meta: Meta<typeof BackButton> = {
  title: "Detail/BackButton",
  component: BackButton,
};

export default meta;
type Story = StoryObj<typeof BackButton>;

export const Default: Story = {};
