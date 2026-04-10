import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";

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
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Enforce explicit return types on module boundaries
      "@typescript-eslint/explicit-module-boundary-types": "error",
      // Flag unused import statements (auto-fixable with --fix)
      "unused-imports/no-unused-imports": "error",
      // Allow unused vars/args prefixed with _ (defer to unused-imports for import lines)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
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
