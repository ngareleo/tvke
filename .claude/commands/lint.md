# Lint

Run type-checking and ESLint across all packages.

```bash
bun run lint
```

Runs `tsc --noEmit && eslint src` in both `server/` and `client/` (via workspace filter). A clean run exits 0.

## Per-package

```bash
cd server && bun run lint
cd client && bun run lint
```

## Key rules enforced

- `@typescript-eslint/explicit-module-boundary-types` — all exported functions need return type annotations
- `@typescript-eslint/no-floating-promises` — unhandled promises must use `void` or be awaited
- `@typescript-eslint/consistent-type-imports` — type-only imports must use `import type`
- `@typescript-eslint/no-non-null-assertion` — `!` is banned; use `?.` or explicit guards
- `react-hooks/rules-of-hooks` / `react-hooks/exhaustive-deps` — hook rules (client only)
- `no-restricted-imports` — `../` cross-module imports are banned in `client/`; use the `~/` alias

## Auto-fix

lint-staged runs ESLint + Prettier auto-fix on staged files at commit time. To fix manually:

```bash
cd server && bunx eslint src --fix
cd client && bunx eslint src --fix
bun run format
```
