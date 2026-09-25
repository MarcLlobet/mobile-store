import { Icon, type IconName } from "./Icon";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const names: IconName[] = [
  "home",
  "back",
  "trash",
  "chevron-left",
  "chevron-right",
  "search",
  "bag-empty",
  "bag-filled",
  "logo",
];

const meta: Meta<typeof Icon> = {
  title: "Primitives/Icon",
  component: Icon,
  args: {
    name: "home",
    size: 24,
    ariaHidden: true,
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {names.map((name) => (
        <div
          key={name}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <Icon name={name} ariaHidden={false} title={name} />
          <span style={{ fontSize: 12 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
