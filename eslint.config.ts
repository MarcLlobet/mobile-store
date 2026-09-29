import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import functional from "eslint-plugin-functional";
import importX from "eslint-plugin-import-x";
import jestDom from "eslint-plugin-jest-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import sonarjs from "eslint-plugin-sonarjs";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

import type { Linter } from "eslint";

/**
 * Each plugin is typed against its own copy of ESLint's types, so their flat configs
 * are structurally incompatible here. Normalise them through one documented boundary
 * instead of casting at every use site.
 */
const asConfigs = (config: unknown): Linter.Config[] =>
  (Array.isArray(config) ? config : [config]) as Linter.Config[];

/** Files that must keep a default export because a framework loads them by convention. */
const DEFAULT_EXPORT_FILES = [
  "src/app/**/page.tsx",
  "src/app/**/layout.tsx",
  "src/app/**/loading.tsx",
  "src/app/**/error.tsx",
  "src/app/**/not-found.tsx",
  "src/app/**/template.tsx",
  "src/app/**/route.ts",
  "src/app/**/{opengraph,twitter}-image.tsx",
  "**/*.stories.tsx",
  "**/*.config.{ts,mts,js,mjs}",
  ".storybook/**/*.{ts,tsx}",
];

const TEST_FILES = [
  "**/*.test.{ts,tsx}",
  "src/test/**/*.{ts,tsx}",
  "mocks/**/*.ts",
  "vitest.setup.ts",
];

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "storybook-static/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
    "public/**",
  ]),

  // ── Base: framework + type-aware TypeScript ────────────────────────────────
  ...nextVitals,
  ...nextTs,
  ...asConfigs(storybook.configs["flat/recommended"]),
  ...asConfigs(tseslint.configs.strictTypeChecked),
  ...asConfigs(tseslint.configs.stylisticTypeChecked),

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: "detect" },
      "import-x/resolver-next": [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
  },

  // ── TypeScript: no escape hatches ─────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/prefer-readonly-parameter-types": "off", // too broad for React props
      "@typescript-eslint/explicit-module-boundary-types": "off", // inference is the point of TS
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // `onClick={() => setOpen(true)}` is idiomatic React, not a confusing void return.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    },
  },

  // ── Functional style: no loops, no mutation, no classes ───────────────────
  {
    files: ["**/*.{ts,tsx,mts}"],
    plugins: { functional },
    rules: {
      "functional/no-loop-statements": "error",
      "functional/no-let": ["error", { allowInForLoopInit: false }],
      "functional/no-classes": "error",
      "functional/no-this-expressions": "error",
      "functional/immutable-data": [
        "error",
        {
          ignoreClasses: false,
          ignoreImmediateMutation: true, // [...xs].sort() is fine
          ignoreAccessorPattern: ["**.current", "**.current.**", "globalThis.**", "window.**"],
          ignoreNonConstDeclarations: false,
        },
      ],
      "functional/prefer-property-signatures": "error",
      // Off on purpose: point-free `.map(fn)` is exactly what Sonar's S7727 and
      // unicorn/no-array-callback-reference forbid, because `map` also passes the
      // index. Sonar wins, so callbacks stay explicit.
      "functional/prefer-tacit": "off",
      "functional/type-declaration-immutability": "off",
      // Deliberately off: these forbid ordinary React/TS code rather than mutation.
      "functional/no-expression-statements": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-return-void": "off",
      "functional/no-throw-statements": "off",
      "functional/no-try-statements": "off",
      "functional/functional-parameters": "off",
      "functional/prefer-immutable-types": "off",
    },
  },

  // ── Array/iteration idioms: prefer declarative transforms ─────────────────
  ...asConfigs(unicorn.configs.recommended),
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "unicorn/no-for-loop": "error",
      // Off on purpose: `for...of` is banned outright, so `forEach` is the only
      // way left to iterate for effect. Banning both leaves no legal option.
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-spread": "error",
      // Off on purpose: `reduce` is the fold this codebase is being pushed towards.
      "unicorn/no-array-reduce": "off",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/explicit-length-check": "error",
      // Conventions that clash with this codebase's Next/React naming.
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off", // React and the DOM both use null
      "unicorn/no-nested-ternary": "off", // prettier owns the formatting; sonarjs owns the nesting
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-global-this": "off",
    },
  },

  // ── SonarCloud parity: the same analyzer rules Sonar runs in CI ───────────
  ...asConfigs(sonarjs.configs?.recommended),
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "sonarjs/cognitive-complexity": ["error", 10],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-duplicate-string": ["error", { threshold: 4 }],
      "sonarjs/no-nested-conditional": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-commented-code": "error",
      // CI runs with --max-warnings=0, so nothing here is warn-level: every rule
      // either blocks the build or is off. An unfinished-work tag blocks it.
      "sonarjs/todo-tag": "error",
      "sonarjs/no-unused-vars": "off", // typescript-eslint owns this
      "sonarjs/deprecation": "off", // @typescript-eslint/no-deprecated reports the same thing
      "sonarjs/unused-import": "off", // import-x owns this
      "sonarjs/prefer-read-only-props": "off",
    },
  },

  // ── Imports: ordered, resolvable, acyclic, named ──────────────────────────
  {
    files: ["**/*.{ts,tsx,mts}"],
    plugins: { "import-x": importX },
    rules: {
      "import-x/no-unresolved": "error",
      "import-x/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true }],
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": ["error", { noUselessIndex: true }],
      "import-x/no-duplicates": ["error", { "prefer-inline": true }],
      "import-x/no-default-export": "error",
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
            { pattern: "@mocks/**", group: "internal" },
            { pattern: "*.module.css", group: "index", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["react", "next/**"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // ── React: correctness and component hygiene ──────────────────────────────
  {
    files: ["**/*.tsx"],
    // `react` and `jsx-a11y` are already registered by eslint-config-next.
    rules: {
      ...react.configs.flat.recommended?.rules,
      ...react.configs.flat["jsx-runtime"]?.rules,
      ...jsxA11y.flatConfigs.strict.rules,

      "react/prop-types": "off", // TypeScript covers this
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
      ],
      "react/destructuring-assignment": ["error", "always"],
      "react/hook-use-state": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-key": ["error", { checkFragmentShorthand: true, warnOnDuplicates: true }],
      "react/jsx-no-constructed-context-values": "error",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "error",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/self-closing-comp": "error",
      "react/void-dom-elements-no-children": "error",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // ── General clean-code budget ─────────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "no-console": "error",
      "no-alert": "error",
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      "no-param-reassign": ["error", { props: true }],
      "prefer-object-spread": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "arrow-body-style": ["error", "as-needed"],
      "object-shorthand": ["error", "always"],
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForStatement, ForInStatement, WhileStatement, DoWhileStatement",
          message: "Use array methods (map/filter/reduce/flatMap) instead of imperative loops.",
        },
        {
          selector: "TSEnumDeclaration",
          message: "Use a union of string literals or an `as const` object instead of an enum.",
        },
      ],
      complexity: ["error", 8],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-nested-callbacks": ["error", 3],
      "no-nested-ternary": "off", // sonarjs/no-nested-conditional reports it with better context
    },
  },

  // ── Per-context relaxations ───────────────────────────────────────────────
  {
    files: DEFAULT_EXPORT_FILES,
    rules: { "import-x/no-default-export": "off" },
  },
  {
    files: ["**/*.config.{ts,mts,js,mjs}", ".storybook/**/*.{ts,tsx}", "vitest.setup.ts"],
    rules: {
      "functional/immutable-data": "off",
      "sonarjs/no-duplicate-string": "off",
      // Plugin authors ship loosely-typed flat configs; normalising them needs assertions.
      "@typescript-eslint/no-unsafe-type-assertion": "off",
    },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "react/function-component-definition": "off",
      // Storybook's own `Meta`/`StoryObj` types are mutable; aliases of them cannot be readonly.
      "sonarjs/no-duplicate-string": "off",
      "functional/immutable-data": "off",
      "max-nested-callbacks": "off",
    },
  },
  {
    files: ["e2e/**"],
    rules: {
      // describe > test > page callback is the shape Playwright asks for.
      "max-nested-callbacks": "off",
      // Collecting the requests a page makes is precisely what these tests do.
      "functional/immutable-data": "off",
      // `networkidle` is the assertion here, not an incidental wait: several of
      // these tests are about which requests happen and which do not.
      "sonarjs/no-networkidle-wait": "off",
      // Code handed to addInitScript runs in the browser, where the DOM lib types
      // over-promise — startViewTransition is not on every engine.
      "@typescript-eslint/no-unnecessary-condition": "off",
      // static-server.mjs is a CLI entry point that Playwright spawns.
      "unicorn/no-process-exit": "off",
      "sonarjs/no-os-command-from-path": "off",
    },
  },
  {
    files: TEST_FILES,
    plugins: { vitest, "testing-library": testingLibrary, "jest-dom": jestDom },
    rules: {
      ...vitest.configs.recommended.rules,
      ...testingLibrary.configs["flat/react"].rules,
      ...jestDom.configs["flat/recommended"].rules,

      "vitest/expect-expect": "error",
      "vitest/no-disabled-tests": "error",
      "vitest/no-focused-tests": "error",
      "vitest/no-identical-title": "error",
      "vitest/prefer-to-be": "error",
      "vitest/valid-expect": "error",
      // Off on purpose: these component tests assert on rendered structure that has
      // no accessible-role equivalent — the `<svg>` an Icon renders, the stacked
      // `<img>` order in PhoneHero, `data-*` pairing between swatch and hero image.
      // Everything reachable by role is already queried by role.
      "testing-library/no-node-access": "off",
      "testing-library/no-container": "off",
      "testing-library/prefer-user-event": "error",

      // Test files describe scenarios; these budgets fight that.
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-identical-functions": "off",
      "max-nested-callbacks": "off",
      "max-lines-per-function": "off",
      "functional/immutable-data": "off",
      "functional/no-let": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },

  // Config and setup files live outside the app's type-aware project graph.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Prettier must stay last: it turns off every stylistic rule it owns.
  prettierConfig,
]);

export default eslintConfig;
