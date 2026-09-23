/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "src/**/*.{ts,tsx}": () => "vitest related --run --passWithNoTests",
  "*.{css,json,md,yml,yaml}": "prettier --write",
};

export default config;
