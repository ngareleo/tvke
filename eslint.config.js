import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * Base ESLint config shared by all workspaces.
 * Each workspace extends this via their own eslint.config.js.
 */
export const baseConfig = tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/__generated__/**",
      "**/relay/__generated__/**",
    ],
  },
  tseslint.configs.recommended,
  {
    rules: {
      // Enforce explicit return types on module boundaries
      "@typescript-eslint/explicit-module-boundary-types": "error",
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Prefer type imports for pure type usage
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // No floating promises
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  prettier
);

export default baseConfig;
