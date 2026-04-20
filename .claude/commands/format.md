# Format

Auto-format all TypeScript, TSX, and JSON files with Prettier.

```bash
bun run format
```

To check without writing (CI mode):

```bash
bun run format:check
```

## Config

Prettier config is in `.prettierrc.json` at the repo root. Ignored paths are in `.prettierignore` (covers `relay/__generated__/`, `dist/`, `node_modules/`, etc.).

## Note

lint-staged runs Prettier automatically on staged files at commit time, so manual formatting is only needed when you want to reformat files you haven't staged yet.
