/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
    "scope-case": [2, "always", "kebab-case"],
  },
};

export default config;
