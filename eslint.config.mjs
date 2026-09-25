import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Components reach data only through the public entry points (src/data/content.ts,
    // src/data/social.ts), so adapters can be swapped without UI changes.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/data/adapters/*", "@/data/adapters/**", "**/data/legacy/**"],
              message: "Import from @/data/content or @/data/social instead of an adapter.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated reports and legacy export.
    "coverage/**",
    "playwright-report/**",
    "data/legacy/**",
  ]),
]);

export default eslintConfig;
