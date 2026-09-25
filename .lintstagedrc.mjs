/**
 * Tasks run by the pre-commit hook on staged files only.
 * @type {import("lint-staged").Configuration}
 */
const config = {
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{css,json,md,yml,yaml}": "prettier --write",
  // Unit tests whose import graph touches the staged source files.
  "src/**/*.{ts,tsx}": (files) =>
    `vitest related --run --passWithNoTests ${files.map((f) => JSON.stringify(f)).join(" ")}`,
};

export default config;
