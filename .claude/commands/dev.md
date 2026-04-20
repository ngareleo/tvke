# Dev

Start the full xstream development environment (server + client).

```bash
bun run dev
```

This runs both workspaces in parallel:
- **Server** — `bun --watch src/index.ts` on `http://localhost:3001` (auto-restarts on file changes)
- **Client** — runs `relay-compiler` first, then `rsbuild dev` on `http://localhost:5173` (proxies `/graphql` to the server including WebSocket upgrades)

## Ports

| Service | URL |
|---|---|
| Client (Rsbuild) | http://localhost:5173 |
| Server (GraphQL + stream) | http://localhost:3001 |
| Storybook (separate) | http://localhost:6006 |

## If the client fails to start

Run `bun relay` from `client/` first — relay-compiler must succeed before Rsbuild can resolve the generated `__generated__/` imports.

## Stopping

```bash
bun run stop
```

Or kill the terminal — `bun run stop` is safe to run at any time.
