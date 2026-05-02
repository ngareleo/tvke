# Release-Design Port — Schema Changes (M2)

> Catalog of every GraphQL + SQLite change M2 lands. UI milestones (M3+)
> consume these via Relay fragments only — no schema work after M2.
>
> **TL;DR — the schema is already mostly there.** The current SDL covers
> Library, Video (with full `metadata` including `posterUrl`),
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

The following are already in `server/src/graphql/schema.ts` and the
production DB. Release-design milestones consume them as-is:

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

**Notes for the M2 implementer:**

- A "show" is a `Video` row whose `mediaType = TV_SHOWS`. The "show"
  itself has no playable file; its `videoId` exists so the show has a
  Relay node ID. Episodes are separate `Video`-shaped rows pointed back
  to the show.
- Two layouts are viable: either a separate `episodes` table referencing
  `videos.id` for the show + `videos.id` for the episode file, **or**
  `episodes` as the canonical row and `videos.id` is the episode itself
  (the show is a synthetic aggregate). M2 picks one and documents it
  here in this section before implementing — update this paragraph
  during M2.
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

Single migration file added to the migrations list in
`server/src/db/migrate.ts`. Order:

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

| Schema element | Files to touch |
|---|---|
| `Video.nativeResolution` resolver | `server/src/graphql/resolvers/video.ts` (new field resolver) + `server/src/graphql/mappers.ts` (height→enum mapper) |
| `Video.seasons` resolver | `server/src/graphql/resolvers/video.ts` (new field resolver) + new `server/src/db/queries/seasons.ts` |
| `Season`, `Episode` types + presenters | `server/src/graphql/presenters.ts` (presenters return objects with `__typename` if union-shaped — these are plain types, no `__typename` required) |
| Episode → Video link | `server/src/graphql/resolvers/video.ts` for `Episode.videoId` if not auto-resolved by graphql-tools |
| Backfill on scan | `server/src/services/libraryScanner.ts` — extend the per-file probe path |

---

## Tests M2 ships (pure-logic only, per the porting policy)

- `server/src/graphql/__tests__/mappers.test.ts` — height→Resolution mapping cases.
- `server/src/db/queries/__tests__/seasons.test.ts` — listing + grouping by season.
- (Existing tests under `server/src/db/queries/__tests__/` continue to pass.)

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
| _(none yet)_ | | | |

---

## Cross-references

- Schema surface (current): `docs/server/GraphQL-Schema/00-Surface.md`
- DB schema docs: `docs/server/DB-Schema/`
- Native-resolution full design: `docs/migrations/rust-rewrite/06-File-Handling-Layer.md` § 5
- Per-component consumers: `docs/migrations/release-design/Components/<Name>.md`
- Plan (out-of-repo): `docs/migrations/release-design/Plan.md`
