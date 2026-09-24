import type { Preview } from "@storybook/nextjs-vite";
// Arimo only ships 400/500/600/700 weight files (no 300/Light) — see
// app/layout.tsx.
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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
