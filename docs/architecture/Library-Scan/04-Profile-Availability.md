# Profile Availability

A library's storage path may disappear at runtime — the user unplugs an external drive, a NAS goes offline, a mount drops. The availability service makes this state first-class so the UI can render it and playback can refuse to start with a copy that can't be read.

## Storage

Two columns on `libraries`:

```sql
status        TEXT NOT NULL DEFAULT 'unknown'
                CHECK (status IN ('online', 'offline', 'unknown'));
last_seen_at  TEXT;   -- ISO-8601 of the most recent probe
```

`status` is `unknown` until the first probe lands (one cycle after server start). `last_seen_at` is updated **every** probe cycle (online or offline) — it's "we successfully ran the probe at this time", not "we last saw it online".

## Probe loop

`services::profile_availability::spawn_periodic_availability` ticks every `scan.availability_interval_ms` (defaults to `scan.interval_ms`, which is 30 s). Each tick:

1. Read every library row.
2. For each, `std::fs::metadata(path)` — if it succeeds and is a directory, status is `online`; otherwise `offline`.
3. Persist `(status, last_seen_at)`.
4. Compare against the previous tick's status. On a flip:
   - `online → offline` — log warn; **no rows touched**. The user can still browse what's catalogued; only playback is blocked.
   - `* → online` — log info; one-shot `scan_one_library` to catch up on changes that happened while offline.

The probe is cheap (one stat per library); cadence can drop without concern.

## Scanner interaction

`scan_libraries` skips libraries with `status = 'offline'`: existing `videos`/`films`/`shows` rows stay put. The probe re-kicks the scan when the library returns. This is the only path that surfaces a library coming back without user action.

## GraphQL

```graphql
enum ProfileStatus { ONLINE OFFLINE UNKNOWN }

type Library implements Node {
  ...
  status: ProfileStatus!
  lastSeenAt: String     # null until first probe
}
```

`Library.status` is part of the read surface — every consumer that lists libraries (`profiles`, `Show.profiles`, `Library` node lookup) sees current reachability without a separate query.

## Picker / playback implications

- `Film.bestCopy` and `Episode.bestCopy` will be extended to **prefer online copies** (declared tech debt — current behaviour returns the highest-resolution copy regardless of online status; see `docs/todo.md`).
- The variant picker (`FilmVariants`) renders copies hosted on offline libraries dimmed with an "offline" badge, and disables the play CTA when the selected copy's library is offline. (Foundation laid; full UI treatment is declared tech debt.)

## UI

`ProfileRow` carries a small status pill: `● online` (green), `○ offline` (red), `○ unknown` (faint). Hover shows `last seen <timestamp>`.

## Cross-references

- [`docs/server/Config/`](../../server/Config/) — `ScanConfig.availability_interval_ms` knob.
- [`docs/architecture/Library-Scan/03-Show-Entity.md`](03-Show-Entity.md) — `Show.profiles` lists the libraries that contain at least one episode file.
- [`docs/architecture/Library-Scan/02-Film-Entity.md`](02-Film-Entity.md) — `Film.copies` will eventually filter by online status (declared tech debt).
