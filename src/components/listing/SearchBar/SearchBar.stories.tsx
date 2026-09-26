import { fn } from "storybook/test";

import { SearchBar } from "./SearchBar";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SearchBar> = {
  title: "Listing/SearchBar",
  component: SearchBar,
  argTypes: {
    placeholder: { control: "text" },
    initialValue: { control: "text" },
  },
  args: { placeholder: undefined, initialValue: "", onSearch: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof SearchBar> = {};
