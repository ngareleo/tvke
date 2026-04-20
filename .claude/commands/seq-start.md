# Seq Start

Start (or create) the Seq structured log management container.

```bash
bun run seq:start
```

- If the `seq` container is already running, exits immediately with a status message.
- If the container exists but is stopped, restarts it.
- If the container doesn't exist, creates it from `datalust/seq:latest` on port `5341`.

Seq UI: **http://localhost:5341**

Data is persisted to `SEQ_STORE` (default: `~/.seq-store`) mounted into the container.

## First-time setup

1. `bun run seq:start`
2. Open http://localhost:5341 → Settings → API Keys → Add API Key
3. Copy the key into `.env`:
   ```
   OTEL_EXPORTER_OTLP_HEADERS=X-Seq-ApiKey=<your-key>
   ```
4. Restart the dev server — traces and logs will flow into Seq automatically.

## Prerequisites

Docker must be running. Check with `docker info`.
