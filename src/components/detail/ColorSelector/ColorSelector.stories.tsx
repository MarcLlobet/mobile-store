import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ColorOption } from "@/lib/api/types";
import { ColorSelector } from "./ColorSelector";

const colors: ColorOption[] = [
  { name: "Black", hexCode: "#1c1c1e", imageUrl: "" },
  { name: "Blue", hexCode: "#3b5f8a", imageUrl: "" },
  { name: "Gold", hexCode: "#d4af7a", imageUrl: "" },
];

const meta: Meta<typeof ColorSelector> = {
  title: "Detail/ColorSelector",
  component: ColorSelector,
  args: { colors },
};

export default meta;
type Story = StoryObj<typeof ColorSelector>;

export const NoneSelected: Story = {
  args: { selected: null },
};

export const OneSelected: Story = {
  args: { selected: colors[1] },
};

// Demonstrates the component being driven by real state, exactly as the
// Detail page's client component (PhoneDetailView) drives it. Start here to
// see the no-shift behaviour: nothing is selected, and the name label below
// the swatches is already occupying its line (hidden with `visibility`), so
// picking a color reveals the text without moving anything.
//
// Hovering has no effect in this story by design — the preview is a `:has()`
// rule that needs the hero image, so it only exists on the assembled Detail
// view.
export const Interactive: Story = {
  render: (args) => {
    function Wrapper() {
      const [selected, setSelected] = useState<ColorOption | null>(null);
      return <ColorSelector {...args} selected={selected} onSelect={setSelected} />;
    }
    return <Wrapper />;
  },
};
