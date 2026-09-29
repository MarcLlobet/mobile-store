import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "https://prueba-tecnica-api-tienda-moviles.onrender.com",
      NEXT_PUBLIC_API_KEY: "test-api-key",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "mocks/**",
        "src/test/**",
        ".storybook/**",
        "storybook-static/**",
        "src/**/*.stories.tsx",
        "src/**/*.d.ts",
        ".next/**",
        "out/**",
      ],
    },
    // `e2e/` is Playwright's; Vitest's default globs would otherwise claim its .spec files.
    exclude: ["node_modules/**", ".next/**", "out/**", "storybook-static/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
      "@mocks": path.resolve(rootDir, "./mocks"),
    },
  },
});
