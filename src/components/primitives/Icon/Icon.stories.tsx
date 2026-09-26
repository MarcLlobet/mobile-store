import { Icon, ICON_NAMES } from "./Icon";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Icon> = {
  title: "Primitives/Icon",
  component: Icon,
  argTypes: {
    name: { control: "select", options: [...ICON_NAMES] },
    size: { control: { type: "range", min: 12, max: 96, step: 2 } },
    ariaHidden: { control: "boolean" },
    title: { control: "text" },
    className: { table: { disable: true } },
  },
  args: { name: "logo", size: 77, ariaHidden: false, title: "Mobile Store" },
};

export default meta;

export const Playground: StoryObj<typeof Icon> = {};
