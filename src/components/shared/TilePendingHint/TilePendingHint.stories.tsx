import { TilePendingHint } from "./TilePendingHint";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TilePendingHint> = {
  title: "Shared/TilePendingHint",
  component: TilePendingHint,
  parameters: {
    docs: {
      description: {
        component:
          "Renders only while a navigation started from its link is pending, and stays invisible for the first 100ms so a prefetched route shows nothing at all.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: 344,
          height: 344,
          border: "1px solid #000",
          display: "grid",
          placeItems: "center",
          font: "12px sans-serif",
        }}
      >
        PRODUCT TILE
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Playground: StoryObj<typeof TilePendingHint> = {};
