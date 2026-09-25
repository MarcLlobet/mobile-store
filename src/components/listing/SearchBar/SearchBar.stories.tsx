import { fn } from "storybook/test";

import { SearchBar } from "./SearchBar";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SearchBar> = {
  title: "Listing/SearchBar",
  component: SearchBar,
  args: {
    onSearch: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};

export const WithInitialValue: Story = {
  args: { initialValue: "iPhone" },
};
