import { Icon } from "./Icon";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Icon> = {
  title: "Primitives/Icon",
  component: Icon,
  argTypes: {
    name: {
      control: "select",
      options: [
        "home",
        "back",
        "trash",
        "chevron-left",
        "chevron-right",
        "search",
        "bag-empty",
        "bag-filled",
        "close",
        "logo",
      ],
    },
    size: { control: { type: "range", min: 12, max: 96, step: 2 } },
    ariaHidden: { control: "boolean" },
    title: { control: "text" },
  },
  args: { name: "search", size: 24, ariaHidden: false, title: "Search" },
};

export default meta;

export const Playground: StoryObj<typeof Icon> = {};
