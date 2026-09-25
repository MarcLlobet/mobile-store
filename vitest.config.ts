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
    // The API client reads these at module load, and so do the MSW handlers
    // in mocks/handlers.ts — both sides must agree on the base URL and the
    // key, or every intercepted request would come back 401. The base URL is
    // the real one so the handlers assert we call the documented host; the
    // key is a test value that never leaves this process.
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
    exclude: ["node_modules/**", ".next/**", "out/**", "storybook-static/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
      "@mocks": path.resolve(rootDir, "./mocks"),
    },
  },
});
