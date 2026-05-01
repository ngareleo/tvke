# Watchlist (page)

> Status: **baseline** (Spec) · **not started** (Production) · last design change **2026-05-01** (PR #46 commit 787f136)

## Files

- `design/Release/src/pages/Watchlist/Watchlist.tsx`
- `design/Release/src/pages/Watchlist/Watchlist.styles.ts`
- Prerelease behavioural reference: n/a — no equivalent page in the Prerelease (Moran) prototype.

## Purpose

Dedicated page (`/watchlist`) listing all films queued for watching. Shows a title block with a count, then a responsive poster-tile grid. Each tile deep-links to the home/Library overlay for that film.

## Route

- Path: `/watchlist`
- Mounted inside `<AppShell>` (shelled layout, header visible).
- Added via `<Route path="/watchlist" element={<Watchlist />} />` inside the shelled `<App.tsx>` route block.

## Visual

### Page header

- **Eyebrow:** `"YOUR WATCHLIST"` — JetBrains Mono, `color: var(--green)`. Small / uppercase / tracked.
- **Title:** `"{N} films queued."` — Anton, 64px, `color: var(--text)`. `{N}` is the count of watchlist tiles.
- **Subtitle:** muted descriptor line below the title — e.g., `"Films you've saved to watch."` or similar. JetBrains Mono or Inter, `color: var(--text-muted)`.

### Tile grid

- `display: grid`, `gridTemplateColumns: repeat(auto-fill, minmax(200px, 1fr))`.
- Gap: `TODO(redesign): confirm gap value` (likely 16–20px).
- Rendered below the page header.

### Tile

Each tile is a `<Link to="/?film={id}">` — clicking deep-links to the Library/home page with `?film=<id>` set, opening the FilmDetailsOverlay for that film.

- **Poster image:** fills the tile, `object-fit: cover`. `TODO(redesign): confirm aspect ratio` (likely 2:3 to match Library tiles).
- **Progress bar (optional):** 3px green bar at the bottom of the poster image, `width: {progress}%`. Only rendered when `progress` is defined for the film. Same green bar pattern as the Library "Continue watching" row tiles.
- **IMDb rating badge:** top-right corner of the poster. Shows the IMDb rating (e.g. `8.3`). Pill or badge shape, `color: var(--text)` or `var(--green)`. `TODO(redesign): confirm exact badge style`.
- **Below-poster section:**
  - **Title:** film title, 12–14px, `color: var(--text)`.
  - **Meta line:** year + genre + duration or similar, JetBrains Mono, `color: var(--text-muted)`.
  - **"Added {addedAt}"** line: shows when the film was added to the watchlist, JetBrains Mono 10px, `color: var(--text-faint)`.

## Behaviour

### Tile click

- Each tile is a `<Link to="/?film={id}">`.
- Navigates to the Library/home page (`/`) with `?film=<id>` in the query string.
- The Library page reads `?film=<id>` on mount and opens the `FilmDetailsOverlay` for that film immediately.
- This is a page navigation (not a modal), so the browser's back button returns to `/watchlist`.

### Data source

- In the lab: derived from the `films` mock array in `src/data/mock.ts` — all films with no `progress` property are treated as watchlist items (same split as Library's "Watchlist" row), plus mock `addedAt` timestamps.
- Production: replace with a Relay query / backend watchlist relation that provides `filmId`, `addedAt`, and optionally `progress`.

## Subcomponents

None promoted — the tile is an inline element within the page. Promote to a separate file (`WatchlistTile`) when porting to production if the tile logic grows.

## TODO(redesign)

- Confirm tile aspect ratio (2:3 assumed from Library tile precedent).
- Confirm tile grid gap value.
- Confirm IMDb badge exact style (colour, shape, positioning within the poster corner).
- Confirm subtitle copy.
- Confirm whether the rating badge uses `var(--green)` text or white.
- Confirm page header vertical spacing and padding.
- Production: decide whether `progress` on a watchlist item means the film is in both "Continue watching" (on Library) and the Watchlist simultaneously, or whether a film transitions out of the Watchlist once it has any progress.

## Porting checklist (`client/src/pages/Watchlist/`)

### Page header

- [ ] Eyebrow `"YOUR WATCHLIST"` in JetBrains Mono, green
- [ ] Title `"{N} films queued."` in Anton 64px
- [ ] Count `{N}` is derived from the number of watchlist items (backend query)
- [ ] Subtitle in muted colour below title

### Tile grid

- [ ] `repeat(auto-fill, minmax(200px, 1fr))` grid
- [ ] Correct gap (fill in after TODO(redesign) resolved)

### Tile

- [ ] Each tile is a `<Link to="/?film={id}">` — navigates to Library overlay for that film
- [ ] Poster image, `object-fit: cover`, 2:3 aspect ratio (confirm after TODO)
- [ ] Optional 3px green progress bar at poster bottom (only if `progress` defined)
- [ ] IMDb rating badge top-right of poster (confirm style after TODO)
- [ ] Below-poster: title + meta line + `"Added {addedAt}"`
- [ ] `addedAt` formatted as a human-readable date/relative string

### Data + backend

- [ ] Derive watchlist items from backend query (filmId, addedAt, optional progress)
- [ ] Replace mock derivation with Relay query
- [ ] Clarify overlap rule with Library "Continue watching" row when `progress` is present

## Status

- [x] Designed in `design/Release` lab (2026-05-01, PR #46 commit 787f136, `feat/release-design-omdb-griffel`, not yet merged to main)
- [ ] Production implementation
