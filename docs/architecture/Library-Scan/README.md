# Library Scan

How the background scanner walks media directories, fingerprints files, and upserts DB rows — plus how the client subscribes to scan state for live UI feedback.

| File | Hook |
|---|---|
| [`00-Flow.md`](00-Flow.md) | Continuous-loop pipeline, concurrent ffprobe + content fingerprint, upsert flow, fingerprint stability across renames. |
| [`01-Filename-Conventions.md`](01-Filename-Conventions.md) | The contract between user filenames/folders and the scanner. Movie file/folder layouts, TV hierarchy, tokens stripped before OMDb lookup, examples that parse and that don't. |
| [`02-Film-Entity.md`](02-Film-Entity.md) | Logical deduplication layer for movies: one Film per movie entity with 1+ video copies. Dedup keys (imdb_id, parsed_title_key), scanner passes, role semantics (main vs extra), watchlist linking, merge flow. |
| [`03-Show-Entity.md`](03-Show-Entity.md) | TV mirror of the Film entity. Two dedup axes (series-level + episode-file-level), drop of the synthetic show-Video pattern, scanner flow, Show ↔ Episode ↔ Video schema. |
| [`04-Profile-Availability.md`](04-Profile-Availability.md) | Periodic probe of library reachability. `libraries.status` / `last_seen_at`, scanner skip on offline, re-kick on offline→online, GraphQL surface, picker behaviour. |
| [`05-Poster-Caching.md`](05-Poster-Caching.md) | Local poster cache. Background worker downloads OMDb poster URLs into `app_cache_dir/posters/`; `/poster/<hash>` route serves the file; GraphQL `posterUrl` rewritten to the local path so the app works offline once posters land. |
