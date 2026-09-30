import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    define: {
      ...viteConfig.define,
      "process.env.STORYBOOK_ASSET_BASE_PATH": JSON.stringify("./"),
    },
  }),
};
export default config;
