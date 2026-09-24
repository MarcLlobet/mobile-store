import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const TextLine: Story = {
  args: { width: 200, height: 16 },
};

export const CardTile: Story = {
  args: { width: 240, height: 240, radius: 8 },
};

export const CardComposite: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 240 }}>
      <Skeleton width={240} height={240} radius={8} />
      <Skeleton width={140} height={14} />
      <Skeleton width={80} height={14} />
    </div>
  ),
};
