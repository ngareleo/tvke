# Release-Design Port — Schema Changes (M2)

> Catalog of every GraphQL + SQLite change M2 lands. UI milestones (M3+)
> consume these via Relay fragments only — no schema work after M2.
>
> **Backend target: Rust.** As of 2026-05-02 the Bun server (`server/`) is
> retired for new feature work — M2 lands directly in `server-rust/`.
> Bun-side paths that previously appeared in this doc have been swapped
> to their Rust counterparts (`migrate.rs`, `types/video.rs`, `scalars.rs`,
> `queries/seasons.rs`, …). The Rust server is async-graphql code-first
> (no separate SDL file), so the GraphQL "schema" lives in the
> `#[Object]` / `#[SimpleObject]` macros on `server-rust/src/graphql/types/`.
>
> **TL;DR — the schema is already mostly there.** The current schema
> covers Library, Video (with full `metadata` including `posterUrl`),
> WatchlistItem, OMDb search, mutations for create/update/delete library,
> match/unmatch video, watchlist add/remove, scan progress with per-library
> done/total counts, listDirectory for the DirectoryBrowser, and
> playback-history. The Release design fits comfortably on top, and M2
> only needs to add: TV-show season/episode hierarchy, per-job
> `nativeResolution`, and a couple of forward-noted helpers.

## Reading this doc

- **Adds** — new types, fields, tables, columns.
- **Renames / repurposes** — existing surface, semantic shift only.
- **Drops** — surface that exists but no consumer remains after the port.
  The Release design does **not** drop anything currently in the SDL —
  the surface is reused.
- **Forward-noted** — already promised in `docs/server/GraphQL-Schema/00-Surface.md`
  but not yet implemented.

---

## What's already there (no change needed)

The following are already exposed by `server-rust/src/graphql/` (typed
via async-graphql `#[Object]` / `#[SimpleObject]` in
`server-rust/src/graphql/types/`) and the production DB. Release-design
milestones consume them as-is:

| Surface | Where it satisfies |
|---|---|
| `Library { name, path, mediaType, videoExtensions, stats, videos(...) }` | Profiles page, ProfileForm, CreateProfile, EditProfile |
| `Video { title, filename, durationSeconds, fileSizeBytes, bitrate, matched, mediaType, metadata, videoStream, audioStream }` | FilmTile, FilmRow, DetailPane, FilmDetailsOverlay |
| `VideoMetadata { imdbId, title, year, genre, director, cast, rating, plot, posterUrl }` | DetailPane, FilmDetailsOverlay, FilmTile (poster) |
| `WatchlistItem { video, addedAt, progressSeconds, notes }` | Watchlist page, FilmDetailsOverlay (in-watchlist indicator) |
| `OmdbSearchResult { imdbId, title, year, posterUrl, plot }` | DetailPane edit-mode OMDb search picker |
| `LibraryScanProgress { scanning, libraryId, done, total }` | Profiles page footer, AppHeader scan indicator |
| `DirEntry { name, path }` + `listDirectory(path)` | DirectoryBrowser |
| `Resolution { 240P … 4K }` | Player resolution picker |
| `Library.mediaType: MediaType (MOVIES \| TV_SHOWS)` | Profile-level discriminator |
| `Video.mediaType: MediaType` | Per-video discriminator (the design's `Film.kind`) |
| Mutations: `createLibrary`, `deleteLibrary`, `updateLibrary`, `matchVideo`, `unmatchVideo`, `addToWatchlist`, `removeFromWatchlist`, `updateWatchProgress`, `recordPlaybackSession`, `setSetting` | Wired to existing UI; M3+ will call from new components verbatim |
| Subscriptions: `libraryScanUpdated`, `libraryScanProgress`, `transcodeJobUpdated` | Reused by Profiles + AppHeader + Player |

**Important consequence:** the design's
`Film.kind: "movie" | "series"` discriminator maps directly onto the
existing `Video.mediaType: MediaType`. Where the Release design says
"kind === 'series'", the production code says
`video.mediaType === "TV_SHOWS"`. Per-component specs should be amended
to use `mediaType` consistently — done as part of the M3+ audit step,
not as a schema change.

The `Film.gradient` field referenced earlier in the plan **does not
exist** in the production schema. No drop required; the field was a
lab-side mock-data placeholder only.

The `feedback*` types referenced earlier in the plan **do not exist** in
the production schema. The `/feedback` route uses an inline page, not a
dedicated schema surface. Only the route + page-component get removed
(M3 task).

---

## Adds (new GraphQL types + fields)

### 1. TV-show structure: `Season` + `Episode` + `Video.seasons`

The Release design models a TV series as a `Video` (the show) with a
nested `seasons: [Season!]!` array. Each `Season` has
`episodes: [Episode!]!`.

```graphql
type Season {
  seasonNumber: Int!
  episodes: [Episode!]!
}

type Episode {
  episodeNumber: Int!
  seasonNumber: Int!
  title: String              # nullable — placeholder if no metadata
  durationSeconds: Float     # nullable — only known if onDisk and probed
  onDisk: Boolean!
  nativeResolution: Resolution    # nullable — only known if onDisk and probed
  videoId: ID                # nullable — null when onDisk is false
}

extend type Video {
  """
  Empty array for movies. Series videos return their full season tree.
  Resolves from the seasons + episodes tables joined on the show's videoId.
  """
  seasons: [Season!]!
}
```

**Notes for the M2 implementer (ratified during M2 implementation, 2026-05-02):**

- A "show" is a `Video` row whose `mediaType = TV_SHOWS`. The "show"
  itself has no playable file; its `videoId` exists so the show has a
  Relay node ID. Episodes are separate `Video`-shaped rows pointed back
  to the show.
- **Chosen layout (M2):** episodes are first-class `Video` rows; the
  `episodes` join table links them to seasons via
  `(show_video_id, season_number, episode_number)` with
  `episode_video_id` pointing back to the episode's `Video.id`. The
  "show" is its own `Video` row with `mediaType = TV_SHOWS` and a
  synthetic id (no playable file). The alternative ("episodes as the
  canonical row, show as a synthetic aggregate") was rejected because
  it duplicates Video state and breaks the existing Relay node-ID
  contract.
- `Episode.videoId` is what the Player URL `/player/:videoId?s=&e=`
  resolves to: clicking an episode chip navigates to the episode's
  `Video.id`.

### 2. `Video.nativeResolution: Resolution!` (forward-noted)

Already promised in `docs/server/GraphQL-Schema/00-Surface.md` (see the
"Forward note — nativeResolution" block at line 71 of the schema doc).
M2 implements:

```graphql
extend type Video {
  """
  Native resolution determined at scan time via ffprobe height →
  closest-rung mapping (rounds DOWN to nearest enum value). Required for
  movies. For series videos this is null at the show level — see
  Episode.nativeResolution.
  """
  nativeResolution: Resolution
}
```

Non-null at the API boundary for movies; nullable for series shows
(which don't carry a native res — episodes do). The DB column is
nullable for backward compatibility with rows scanned before the column
existed.

For full design rationale see
`docs/migrations/rust-rewrite/06-File-Handling-Layer.md` § 5
(Resolution handling). M2 in this PR implements only the read side
(scan + expose); the picker-clamping client work happens in M7.

### 3. (No new mutations needed)

The existing mutation surface covers every UI interaction the Release
design requires. M3+ wire to them as-is.

---

## SQLite migrations (M2)

Extend the existing `execute_batch` block in `server-rust/src/db/migrate.rs`.
Migrations are idempotent (`CREATE TABLE IF NOT EXISTS`); the column-add
is guarded by a `PRAGMA table_info(videos)` introspection. Order:

```sql
-- Migration N: release-design-tv-shows-and-native-res
BEGIN;

-- 1. Add native_resolution to videos.
ALTER TABLE videos ADD COLUMN native_resolution TEXT;
-- TEXT enum: '240p', '360p', '480p', '720p', '1080p', '4k'.
-- NULL for rows scanned before this migration; backfill on next scan.

-- 2. New episodes table (preferred layout: episodes are first-class
--    Video rows, plus a join table linking them to seasons of a show).
CREATE TABLE seasons (
  show_video_id   TEXT    NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  season_number   INTEGER NOT NULL CHECK (season_number > 0),
  PRIMARY KEY (show_video_id, season_number)
);

CREATE TABLE episodes (
  show_video_id    TEXT    NOT NULL REFERENCES videos(id)  ON DELETE CASCADE,
  season_number    INTEGER NOT NULL,
  episode_number   INTEGER NOT NULL CHECK (episode_number > 0),
  title            TEXT,
  episode_video_id TEXT             REFERENCES videos(id)  ON DELETE SET NULL,
  PRIMARY KEY (show_video_id, season_number, episode_number),
  FOREIGN KEY (show_video_id, season_number)
    REFERENCES seasons(show_video_id, season_number) ON DELETE CASCADE
);

CREATE INDEX idx_episodes_show ON episodes(show_video_id);
CREATE INDEX idx_episodes_video ON episodes(episode_video_id);

COMMIT;
```

**Backfill notes:**

- `videos.native_resolution` is populated by the next scanner pass for
  every existing row — the scanner reads the existing
  `videoStream.height` and rounds down to the nearest `Resolution` enum
  value. M2 includes a one-shot backfill pass guarded by
  `WHERE native_resolution IS NULL`.
- `seasons` + `episodes` start empty. The next scanner pass detects
  TV-show-shaped libraries (mediaType = `TV_SHOWS`) and groups files
  by parsed filename pattern (`S01E03`, `1x03`, etc.) — see
  `Components/ProfileForm.md` for the parsing semantics. The first
  user-triggered or timer-driven scan after deploy populates them.

The M2 agent picks the layout for episodes (synthetic show row vs.
episodes-as-videos) at implementation time, lands the migration, and
**updates the Adds section above** so this doc reflects what shipped.

---

## Resolver / mapper / presenter pointers

In Rust, async-graphql is code-first: there is no separate SDL,
resolvers, presenters, and types live together inside the type files'
`#[Object]` / `#[ComplexObject]` impl blocks, and what Bun called a
"presenter" is the `from_row` impl on each GraphQL struct.

| Schema element | Files to touch |
|---|---|
| `Video.nativeResolution` field | `server-rust/src/graphql/types/video.rs` (add field + populate in `Video::from_row`) + `server-rust/src/graphql/scalars.rs` (`Resolution::from_height` mapper) |
| `Video.seasons` field resolver | `server-rust/src/graphql/types/video.rs` (new async fn on `#[ComplexObject]`) + new `server-rust/src/db/queries/seasons.rs` |
| `Season`, `Episode` types | New files `server-rust/src/graphql/types/season.rs` and `episode.rs` (each a `#[derive(SimpleObject)]` or `#[Object]`) — re-export from `server-rust/src/graphql/types/mod.rs` |
| Episode → Video link | `Episode.videoId` is a struct field on `Episode`; populated when the row's `episode_video_id` is non-null. No async resolver needed for the ID itself. |
| Backfill on scan | `server-rust/src/services/library_scanner.rs` — extend the per-file probe path to compute `native_resolution` from probed height; one-shot backfill at scanner startup for `WHERE native_resolution IS NULL`. |

---

## Tests M2 ships (pure-logic only, per the porting policy)

Rust test idiom: `#[cfg(test)] mod tests { ... }` colocated at the bottom
of each source file (matches the existing pattern in
`server-rust/src/db/queries/videos.rs` and `jobs.rs`).

- `server-rust/src/graphql/scalars.rs` — `Resolution::from_height` boundary cases.
- `server-rust/src/db/queries/seasons.rs` — listing + grouping by season.
- (Existing 250 tests across `server-rust/` continue to pass.)

Component-level resolver tests are not required (the existing test suite
already covers query/mutation routing).

---

## Rollback / safety notes

- Migrations are forward-only. The PR is the v1 schema; if a problem
  surfaces post-merge, fix forward in a follow-up.
- The `seasons` + `episodes` tables are independent — dropping them does
  not affect movie playback. If a follow-up needs to retract TV-show
  support, a separate migration drops them.
- `videos.native_resolution` is nullable and additive — zero risk to
  existing rows.

---

## Post-M2 patch protocol

If a milestone in M3+ discovers a missing schema field:

1. Stop the milestone work.
2. Add the field with a tiny patch commit on the same branch (resolver +
   presenter + SDL + SQL if needed). One field per patch commit.
3. Append a row to the **Post-M2 patches** table below, including the
   commit SHA and the field name.
4. Resume the milestone.

### Post-M2 patches

| Date | Field | Commit | Reason |
|---|---|---|---|
| 2026-05-02 | TV-show OMDb-driven discovery + seasons/episodes hydration | _(in flight, same PR)_ | Delivers what the prior deferral row described, on top of the M2 schema. Algorithm: walk the user's directory tree at the canonical three levels (`<library>/<Show>/<Season>/<Episode>`), parse `Season N` / `S01` / `1` from the level-2 dirname, parse `SxxExx` / `NxNN` from level-3 filenames. In parallel, query OMDb for each show: `?s=<title>&type=series` → `?i=<imdbID>` (for `totalSeasons`) → per-season `?i=<imdbID>&Season=N`. Merge the two trees: matched episodes get `title=Some(omdb)` + `episode_video_id=Some(local)`; OMDb-only episodes become rows with `episode_video_id=None` (UI shows them greyed-out as missing on disk); local-only episodes (OMDb miss for the show, or filename outside the canonical episode list) get rows with `title=None` + `episode_video_id=Some(local)`. Show-level OMDb metadata (poster, plot, year, rating, totalSeasons via genre/plot/poster_url) lands on the synthetic show video's `video_metadata` row so `Video.metadata.posterUrl` resolves correctly. Daily-budget guard on OMDb (`AppConfig.omdb_daily_budget`, default 800/1000) protects the free-tier quota: requests increment a shared atomic counter; remaining < 50 logs a warn; exhausted skips further calls. Subscription progress fires per OMDb call with `phase` ∈ {`scanning_files`, `discovering_tv`, `fetching_omdb`, `auto_matching`} + `current_item` (e.g. "Breaking Bad S03"). Code: `server-rust/src/services/tv_discovery.rs` (new) + extensions to `omdb.rs`, `scan_state.rs`, `library_scanner.rs`, `graphql/types/misc.rs`. |

---

## Cross-references

- Schema surface (current): `docs/server/GraphQL-Schema/00-Surface.md`
- DB schema docs: `docs/server/DB-Schema/`
- Rust DB conventions: `docs/migrations/rust-rewrite/05-Database-Layer.md`
- Native-resolution full design: `docs/migrations/rust-rewrite/06-File-Handling-Layer.md` § 5
- Per-component consumers: `docs/migrations/release-design/Components/<Name>.md`
- Plan (in-repo): `docs/migrations/release-design/Plan.md`
