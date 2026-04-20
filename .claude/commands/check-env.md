# Check Env

Audit environment variable configuration against expected values.

```bash
bun run check-env             # dev mode — warns on missing optionals
bun run check-env -- --prod   # production mode — errors on unsafe defaults
```

Loads `.env` from the repo root if present, then checks each variable and prints a colour-coded summary.

## Check types

| Helper | Behaviour |
|---|---|
| `check_secret` | Name shown **bold green** if set, **bold red** if not. Value never printed. |
| `check_default` | Always passes — shows effective value or built-in default. |
| `check_optional` | Warns if unset; functionality is degraded but not broken. |
| `check_required` | Errors if unset. |
| `check_not_localhost` | Errors in `--prod` if a URL variable still points to localhost. |

## Exit codes

- `0` — all checks passed (or only warnings)
- `1` — one or more required variables missing or unsafe for production

## Variables checked

**Server:** `NODE_ENV`, `PORT`, `DB_PATH`, `SEGMENT_DIR`, `SCAN_INTERVAL_MS`, `SEGMENT_CACHE_GB`  
**Metadata:** `OMDB_API_KEY`  
**Telemetry (server):** `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`  
**Telemetry (client):** `PUBLIC_OTEL_ENDPOINT`, `PUBLIC_OTEL_HEADERS`  
**Seq (dev only):** `SEQ_ADMIN_PASSWORD`, `SEQ_STORE`

## Adding a new variable

1. Add it to `.env.example` with a placeholder and one-line comment
2. Add a `check_*` call to the appropriate section in `scripts/check-env.sh`
3. Wire it into `server/src/config.ts` if the server reads it
4. Run `bun run check-env` to confirm it appears correctly
