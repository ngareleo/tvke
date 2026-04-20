# Clean

Stop all processes, then wipe encoded segment output and test databases.

```bash
bun run clean        # wipe segments + test DBs, preserve main DB
bun run clean:db     # also wipe tmp/xstream.db (forces full rescan on next start)
```

## What gets removed

| Path | Removed by | Notes |
|---|---|---|
| `tmp/segments/*/` | both | ffmpeg output; can be GBs; safe to delete — re-transcoded on demand |
| `/tmp/xstream-test-*/` | both | per-test SQLite DBs written by the test suite |
| `tmp/xstream.db` | `clean:db` only | media library DB — wipe only when you want a full rescan |

## When to use `clean:db`

- Schema changed and the existing DB has an incompatible `content_fingerprint` or missing column
- You want to rescan all media from scratch
- The `tmp/` DB was created before `content_fingerprint TEXT NOT NULL` was added (delete and let the server recreate it)
