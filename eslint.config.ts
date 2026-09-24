import type { Linter } from "eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";
import prettierConfig from "eslint-config-prettier";

// eslint-plugin-storybook's flat config is published typed against a
// slightly different eslint/@typescript-eslint version than this project
// resolves, so its `rules`/`plugins` shape doesn't structurally satisfy
// `defineConfig`'s stricter `ConfigWithExtends` type. The array is valid
// ESLint flat config at runtime (this is a types-only mismatch between
// two versions of the same shape) — cast it through `Linter.Config[]`
// rather than loosening the rest of this file's type safety.
const storybookRecommended = storybook.configs["flat/recommended"] as Linter.Config[];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybookRecommended,
  prettierConfig,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Standalone Node CLI tooling, not app code — progress/error logging is
    // the entire point, unlike the strict no-console app-wide default above.
    files: ["scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "storybook-static/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
