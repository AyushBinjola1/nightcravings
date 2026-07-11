import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tanstackQuery from "@tanstack/eslint-plugin-query";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tanstackQuery.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Requires type information — scoped to ts/tsx above so config files
      // (eslint.config.mjs, etc.) don't need a tsconfig project mapping.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    rules: {
      // Coding standards, Phase 4 §21 — enforced, not just documented.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Use the '@/*' alias instead of relative parent imports (Phase 4 §20).",
            },
          ],
        },
      ],
      // eslint-config-next ships jsx-a11y's recommended rules; the ones
      // below are tightened past "recommended" to match the WCAG AA bar
      // set across all four approved phase documents.
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/media-has-caption": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/prefer-tag-over-role": "error",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "docs/**",
  ]),
]);

export default eslintConfig;
