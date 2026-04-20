# Build

Build the server and client for production.

```bash
bun run build
```

Runs sequentially:
1. `bun run --filter server build` — bundles `server/src/index.ts` → `server/dist/index.js` (target: bun)
2. `bun run --filter client build` — runs `tsc --noEmit` then Rsbuild; output goes to `client/dist/`

## Starting the production server

```bash
cd server && bun run start
# NODE_ENV=production bun dist/index.js
```

Set `PORT`, `DB_PATH`, `SEGMENT_DIR`, and `SCAN_INTERVAL_MS` env vars as needed.  
Run `bun run check-env --prod` first to catch missing variables.

## Common failures

| Symptom | Fix |
|---|---|
| `Cannot find module '~/relay/__generated__/...'` | Run `bun relay` from `client/` before building |
| TypeScript errors during `tsc --noEmit` | Fix the type errors — the build does not emit on error |
| Rsbuild chunk name warnings | Ensure all `import()` calls have `/* webpackChunkName: "Name" */` comments |
