import Link from "next/link";

import { Page } from "./Page";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Page> = {
  title: "Layout/Page",
  component: Page,
  argTypes: {
    width: { control: "inline-radio", options: ["wide", "column"] },
    lead: { control: "boolean", mapping: { true: <Link href="/">← BACK</Link>, false: undefined } },
    children: { control: "text" },
    className: { table: { disable: true } },
    role: { table: { disable: true } },
  },
  args: { width: "wide", lead: undefined, children: "Page content" },
  decorators: [
    (Story) => (
      <div style={{ outline: "1px dashed #c9c9c9" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof Page> = {};
