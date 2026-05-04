# Poster Caching

OMDb metadata carries a `Poster` URL pointing at the OMDb CDN (currently `m.media-amazon.com`). Hitting that URL on every render means the app:

1. **Stops working offline** the moment the user disconnects.
2. **Hammers the OMDb CDN** for content that's effectively immutable.
3. **Couples render latency to a third party** that has nothing to do with playback.

The poster cache fixes this by downloading every OMDb poster into the user's local cache directory and serving it from the same origin as the GraphQL endpoint.

## Storage

| Mode | Path |
|---|---|
| Tauri (prod) | `app_cache_dir()/posters/` (per-OS — XDG on Linux, `~/Library/Caches` on macOS, `%LOCALAPPDATA%` on Windows) |
| Dev | `tmp/poster-cache/` at repo root |

The path is set via `AppConfig.poster_dir`, mirroring `segment_dir`. `ServerConfig` plumbs it through `with_paths` / `dev_defaults` and the Tauri shell wires it from `app.path().app_cache_dir()`.

Files inside the directory are content-addressed by `sha1(poster_url)+ext` (extension preserved from the URL, defaulting to `.jpg`). A given OMDb poster URL maps to exactly one filename — the same URL across films / shows shares one cached file.

## DB shape

Two metadata tables carry an OMDb `poster_url`:

- `video_metadata.poster_url`
- `show_metadata.poster_url`

Each gains a sibling `poster_local_path TEXT` (basename only, e.g. `abc123…ef.jpg`) that the worker fills in once the download lands. The OMDb URL stays as the canonical source — it's still useful as a fallback when the local copy is missing or download has failed.

`upsert_*_metadata` does **not** write `poster_local_path` — it's worker-managed. On conflict the existing local path is preserved (COALESCE pattern) so a re-match against the same OMDb URL doesn't bounce a freshly-downloaded copy. Stale-cache invalidation when the OMDb URL itself changes is logged tech debt.

## Worker

`services::poster_cache::spawn_periodic_poster_cache` runs every `POLL_INTERVAL` (15 s). Each cycle:

1. `list_videos_needing_poster_download` + `list_shows_needing_poster_download` — rows with `poster_url IS NOT NULL AND poster_local_path IS NULL`.
2. Dedupe in-flight URLs across cycles (a slow download from cycle N+1 doesn't re-download for cycle N+2).
3. Concurrent fetch with `MAX_CONCURRENCY = 4` (`reqwest::Client` with a 20 s timeout and a `User-Agent: xstream/poster-cache`).
4. Atomic write: stage to `<basename>.part`, rename to `<basename>`. A crash mid-download leaves the `.part` behind but never a half-written `<basename>`.
5. `set_*_poster_local_path(owner_id, basename)` — single UPDATE per row.

Per-row failures log a `warn!` and are retried on the next cycle (no failure-state recorded in DB). Network blips, OMDb outages, and 4xx all heal automatically once the upstream comes back.

## HTTP route

`GET /poster/:basename` (`routes::poster::get_poster`):

- Validates the basename (alphanumeric + a single dot — rejects `..`, `/`, leading dots).
- Streams the file from `poster_dir` with `Content-Type` derived from the extension and `Cache-Control: public, max-age=31536000, immutable`.
- 404 when the file isn't (yet) cached. Common case before the worker has caught up.

Same-origin as the GraphQL endpoint, so the client doesn't need to know the cache directory exists.

## Client

The GraphQL `posterUrl` field on `VideoMetadata` and `ShowMetadata` is rewritten by `graphql::types::poster_url_for_metadata`:

- If `poster_local_path` is set → return `/poster/<basename>`.
- Else fall back to `poster_url` (the OMDb URL).

The Poster component on the client doesn't need any change — it just renders the URL it gets back. After the first scan + worker cycle, every poster on the page resolves to a local-disk copy.

## Failure modes

| Failure | Behaviour |
|---|---|
| OMDb returns the URL but the CDN 404s the image | Worker logs warn; row stays `poster_local_path NULL`; client shows the OMDb URL (which 404s in the `<img>`). Retried every poll cycle — declared tech debt to back off. |
| Disk write fails | Worker logs warn; no DB update; retries next cycle. |
| Disk full | Same as above; worker keeps retrying. Eviction policy is declared tech debt. |
| App restarts mid-download | `.part` stragglers stay; next cycle re-downloads cleanly (the partial isn't visible to the route until rename). |
| User changes OMDb match → poster URL changes | Currently the cached file stays; the new URL won't be downloaded until `poster_local_path` is cleared. Declared tech debt. |

## Cross-references

- [`02-Film-Entity.md`](02-Film-Entity.md) — Film metadata pipeline.
- [`03-Show-Entity.md`](03-Show-Entity.md) — Show metadata pipeline.
- [`docs/server/Config/`](../../server/Config/) — `AppConfig.poster_dir` knob.
- [`docs/server/DB-Schema/`](../../server/DB-Schema/) — `video_metadata` + `show_metadata` table layouts.
