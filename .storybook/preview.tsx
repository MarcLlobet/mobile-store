import type { Preview } from "@storybook/nextjs-vite";
import "@fontsource/arimo/400.css";
import "../src/styles/reset.css";
import "../src/styles/tokens.css";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },
  },
};

export default preview;
