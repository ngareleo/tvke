# Show Entity (Logical TV-Series Deduplication)

The Show entity is the TV mirror of [`02-Film-Entity.md`](02-Film-Entity.md). It separates **series identity** (a logical TV show) from **episode files on disk** (one or many `videos` rows per coordinate).

## Two layers

- **Logical layer** — `shows` table. One row per distinct series.
- **File layer** — `videos` table. Episode files are linked back via `(show_id, show_season, show_episode)`.

A `videos` row that's an episode file has `show_id` set; movies have `film_id` set; nothing has both.

## Deduplication, two axes

1. **Series-level dedup** — the same show present in two libraries (`/movies/Breaking Bad/` and `/tv2/Breaking Bad/`) collapses to one `Show` row. Same key strategy as Film: prefer `imdb_id` (canonical, set after OMDb match) with `parsed_title_key` ("breaking bad|") as the pre-OMDb fallback. Matches that arrive late merge via `merge_shows`.
2. **Episode-file dedup** — the same episode file (`Breaking.Bad.S01E01.mkv`) indexed in two libraries produces two `videos` rows pointing at the same `(show_id, season, episode)` coordinate. `Episode.copies` exposes them as variants in the picker, mirroring `Film.copies` for movies.

## Why no synthetic show-Video

The Prerelease design used a synthetic `videos` row per series (path = the show directory, `content_fingerprint = "show:<id>"`) so the seasons/episodes tree could FK back to it. That worked but conflated series identity with file identity. The Show entity drops it cleanly:

- `videos.show_id` (nullable) replaces the FK from episodes/seasons to a synthetic row.
- `seasons` and `episodes` are re-keyed on `show_id` directly.
- `episodes.episode_video_id` is **gone** — episode files are derived via `videos WHERE show_id=? AND show_season=? AND show_episode=?`, which is exactly what supports axis-2 dedup.

This was a pre-prod break. There's no migration story; the dev DB is wiped on schema change. See `feedback_breaking_changes_preprod.md` for the rationale.

## Schema

```sql
CREATE TABLE shows (
  id                 TEXT PRIMARY KEY,
  imdb_id            TEXT UNIQUE,
  parsed_title_key   TEXT UNIQUE,
  title              TEXT NOT NULL,
  year               INTEGER,
  created_at         TEXT NOT NULL,
  CHECK (imdb_id IS NOT NULL OR parsed_title_key IS NOT NULL)
);
CREATE TABLE show_metadata (
  show_id    TEXT PRIMARY KEY REFERENCES shows(id) ON DELETE CASCADE,
  imdb_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  year       INTEGER, genre TEXT, director TEXT, cast_list TEXT,
  rating     REAL, plot TEXT, poster_url TEXT,
  matched_at TEXT NOT NULL
);
ALTER TABLE videos ADD COLUMN show_id TEXT REFERENCES shows(id) ON DELETE SET NULL;
ALTER TABLE videos ADD COLUMN show_season INTEGER;
ALTER TABLE videos ADD COLUMN show_episode INTEGER;
CREATE INDEX videos_show ON videos(show_id, show_season, show_episode);

-- seasons / episodes re-keyed on show_id (was show_video_id)
-- episodes.episode_video_id dropped
```

## Scanner flow

`tv_discovery::discover_one_show` per series directory:

1. **Resolve identity** — `resolve_show_for_directory` returns the Show keyed on `parsed_title_key`, creating one if absent.
2. **Link local episodes** — for each parseable `(season, episode)` file in the local tree, `assign_video_to_show(video_id, show_id, season, episode)`.
3. **OMDb lookup (best-effort)** — `search_series` → `series_details` → `season_episodes` per season.
4. **Stamp imdb_id** — `link_show_to_imdb(show_id, imdb_id)` stamps the row in place, OR (when another show already holds that imdb_id) merges into it via `merge_shows`. Episode-link rows from step 2 are re-pointed when a merge happens.
5. **Persist tree** — merge local + OMDb episode lists; upsert `seasons` + `episodes` rows on the canonical `show_id`.

## GraphQL surface

```graphql
type Show implements Node {
  id: ID!  title: String!  year: Int
  metadata: ShowMetadata
  profiles: [Library!]!         # libraries with ≥1 episode file
  seasons: [Season!]!
}
type Episode {
  seasonNumber: Int!  episodeNumber: Int!  title: String
  durationSeconds: Float
  onDisk: Boolean!
  copies: [Video!]!     # res-desc/bitrate-desc; multiple rows = axis-2 dedup
  bestCopy: Video       # null when off-disk
  videoId: ID           # carry-over for clients keyed on a single video; tech debt
}
type Video implements Node {
  ...
  show: Show            # null for movies + unmatched episodes
  seasonNumber: Int     # episode-file convenience
  episodeNumber: Int
}
type Query {
  shows(first: Int, libraryId: ID, search: String): ShowConnection!
  show(id: ID!): Show
}
```

`Video.seasons` is **gone**. Use `Show.seasons` or `Video.show.seasons` to traverse.

## Client model

- Homepage TV row queries `shows`; renders `ShowTile`.
- Selecting a TV tile opens `ShowDetailsOverlay` (URL: `?show=<id>`, sibling to `?film=<id>`).
- `SeasonsPanel` consumes `Video.show.seasons` so existing call-sites (FilmRow, DetailPane, FilmDetailsOverlay, PlayerContent) keep working with a one-line traversal change.

## Cross-references

- [`02-Film-Entity.md`](02-Film-Entity.md) — Film mirror; same dedup contract.
- [`04-Profile-Availability.md`](04-Profile-Availability.md) — `Library.status` filters which copies the picker offers.
- [`docs/server/DB-Schema/`](../../server/DB-Schema/) — full table layout.
- [`docs/server/GraphQL-Schema/`](../../server/GraphQL-Schema/) — surface contract.
