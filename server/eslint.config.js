import { baseConfig } from "../eslint.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // no-floating-promises requires type info (parserOptions.project)
    "@typescript-eslint/no-floating-promises": "error",
  },
});
