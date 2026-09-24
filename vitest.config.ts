import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  // @vitejs/plugin-react is used here purely as a test-time JSX/Fast-Refresh
  // transform for Vitest. It is NOT the app's build tool — Next.js still owns
  // the real dev/build pipeline (see next.config.ts).
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/**",
        ".storybook/**",
        "storybook-static/**",
        "src/**/*.stories.tsx",
        "src/**/*.d.ts",
        ".next/**",
        "out/**",
      ],
    },
    exclude: ["node_modules/**", ".next/**", "out/**", "storybook-static/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
