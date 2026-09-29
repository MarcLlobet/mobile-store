import type { Preview } from "@storybook/nextjs-vite";
import "@fontsource/arimo/latin-400.css";
import "../src/styles/reset.css";
import "../src/styles/tokens.css";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "error",
      config: {
        rules: [
          { id: "landmark-one-main", enabled: false },
          { id: "page-has-heading-one", enabled: false },
          { id: "region", enabled: false },
        ],
      },
    },
  },
};

export default preview;
