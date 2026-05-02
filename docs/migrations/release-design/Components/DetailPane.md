# DetailPane

> Status: **baseline** (Spec) · **not started** (Production)
> Spec updated: 2026-05-02 — Action row uses two distinct text-link styles: `playAction` (green text + green underline, white text + white underline on hover) and `editAction` (white text + faint white underline, green text + green underline on hover). "Play" label now reads `▶ Play` (resolved from "Play in {resolution}"). "Edit" button styled as white underline text.

## Files

- `design/Release/src/components/DetailPane/DetailPane.tsx`
- `design/Release/src/components/DetailPane/DetailPane.styles.ts`
- Prerelease behavioural reference: `design/Prerelease/src/components/DetailPane/`

## Purpose

Right-rail film detail card. Identical structure on the Profiles and Library pages; opens via the parent's URL pane state (`?film=<id>`).

## Visual

### Container
- `borderLeft: 1px solid var(--border)`.
- `display: flex; flex-direction: column`.
- `background: var(--bg-1)`, `overflow: hidden`, `height: 100%`.

### Hero block (`<Poster>` wrapper, top of pane)
- 220px tall, `flex-shrink: 0`, `position: relative`.
- `<Poster>` fills via `width/height: 100%`, `object-fit: cover`.
- Bottom-fade gradient overlay: `linear-gradient(180deg, transparent 50%, var(--bg-1))`.
- Close button (`onClose` callback): 26×26, `top: 12, right: 12`, `border: 1px solid var(--border)`, `background: rgba(0,0,0,0.6)`, `color: var(--text-dim)`, `borderRadius: 3px`, hosts `<IconClose>`. `aria-label="Close detail pane"`.

### Body block
- `padding: 16px 22px`, `flex: 1`, `overflow-y: auto`.

#### Action row (top of body) — view mode
- Two text-link elements side-by-side: `display: flex`, `alignItems: center`, `columnGap: 18px`.
- **Play link** (`playAction`) — `<Link to={\`/player/\${film.id}\`}>` with label `▶ Play`.
  - JetBrains Mono 11px, `letterSpacing: 0.18em`, uppercase, `backgroundColor: transparent`, no border, `paddingTop: 0`, `paddingBottom: 2px`, `paddingLeft: 0`, `paddingRight: 0`.
  - `color: tokens.colorGreen`, `textDecorationLine: underline`, `textDecorationColor: tokens.colorGreen`, `textDecorationThickness: 1px`, `textUnderlineOffset: 4px`.
  - Transition `color, text-decoration-color, opacity` on `0.15s`.
  - On `:hover`: `color: tokens.colorText`, `textDecorationColor: tokens.colorText` (green underline + text both flip to white).
- **Edit button** (`editAction`) — `<button>` with label `Edit`.
  - Same font as Play: Mono 11px, `letterSpacing: 0.18em`, uppercase, no border, padding `0 0 2px 0`.
  - `color: tokens.colorText` (white), `textDecorationLine: underline`, `textDecorationColor: rgba(232, 238, 232, 0.35)` (faint white), `textDecorationThickness: 1px`, `textUnderlineOffset: 4px`.
  - Transition `color, text-decoration-color, opacity` on `0.15s`.
  - On `:hover`: `color: tokens.colorGreen`, `textDecorationColor: tokens.colorGreen` (text and underline flip to green).
  - Clicking calls `onEditChange(true)` to switch to edit mode.

#### Title
- Anton 32px, `letter-spacing: -0.01em`, `text-transform: uppercase`, `color: var(--text)`.
- Falls back to `"Unmatched file"` when `film.title` is null.

#### Eyebrow row
- JetBrains Mono 11px, `letter-spacing: 0.1em`, uppercase, `color: var(--text-muted)`.
- Joins `[year, genre, duration].filter(Boolean)` with ` · `.

#### Chip row
- Flex wrap, 6px gap.
- `<span className="chip green">{film.resolution} UHD</span>`
- `<span className="chip">{hdrLabel}</span>` (only when `film.hdr` is set and not `"—"`)
- `<span className="chip">{film.codec}</span>`
- `<span className="chip">{film.audio} {film.audioChannels}</span>`
- Chip styles come from `shared.css` (`.chip`, `.chip.green`).

#### IMDb + on-disk row
- Conditional `<ImdbBadge />` + `<span style={{ color: "var(--yellow)" }}>{rating}</span>` + faint `·` separator (when `film.rating !== null`).
- Then `<span>{film.duration}</span>`, faint `·`, `<span style={{ color: "var(--green)" }}>● ON DISK</span>`.

#### Plot paragraph (conditional)
- `font-size: 12px`, `color: var(--text-dim)`, `line-height: 1.55`.

#### Cast (conditional)
- Eyebrow `CAST` (Mono 9px / 0.22em / faint).
- Chip per cast member.

#### File info box
- Eyebrow `FILE`.
- Box: `background: var(--surface)`, `border: 1px solid var(--border-soft)`, `padding: 12px`, JetBrains Mono 10px, `color: var(--text-dim)`, `line-height: 1.7`.
- Line 1: `{film.filename}`.
- Line 2 (`color: var(--text-muted)`): `{size} · {bitrate} · {frameRate} · {container}`.

## Edit mode

The DetailPane has two internal modes: **view** (default) and **editing** (triggered by the Edit button). When `editing === true`, the action row + title + all display sections are replaced by an inline form.

### View mode (default)

Rendered when `editing === false`. Shows the standard action row (Play + Edit buttons), title, metadata sections, plot, cast, and file info — exactly as described above.

### Edit mode

Triggered by clicking the Edit button (calls `onEditChange(true)`) or when the pane mounts with `initialEdit={true}`. Replaces the entire visible content with the `<DetailPaneEdit>` sub-component.

#### `DetailPaneEdit` sub-component (inline in edit mode)

Form with four fields and a two-button footer:

- **Title field (`editField`):** `<input type="text">` with label "Title" above. JetBrains Mono 11px, white text. Placeholder: grey text (muted). Value synced to local state; resets when `film.id` changes.
- **Year field (`editField`):** `<input type="text">` with label "Year". Same styling. Accepts numeric or text input (left to the implementation to validate/parse).
- **IMDb ID field (`editField`):** `<input type="text">` with label "IMDb ID". Same styling. Placeholder: grey (optional field).
- **Plot textarea (`editTextarea`):** `<textarea>` with label "Plot" above. JetBrains Mono 11px, white text. 3 rows (or dynamic height). Placeholder: grey text.

All four fields:
- `backgroundColor: rgba(232, 238, 232, 0.05)`, `borderRadius: 3px`, `border: 1px solid var(--border-soft)`, `paddingTop/Bottom: 8px`, `paddingLeft/Right: 12px`.
- Focus: `borderColor: var(--border)`, `outline: none`.
- On change: update local state immediately.

#### Edit mode footer (`editFooter`)

Below the form fields: two text-action buttons.

- **Cancel button:** Mono 11px / uppercase / `letterSpacing: 0.16em`. `color: var(--text-muted)`, `textDecorationLine: underline`, `textDecorationColor: rgba(232, 238, 232, 0.35)`, `textUnderlineOffset: 3px`. Hover: `color: var(--text)`. Label: `[ESC] Cancel`. Clicking calls `onEditChange(false)` (exits edit mode without saving).
- **Save button:** Mono 11px / uppercase / `letterSpacing: 0.16em`. `color: var(--green)`, `textDecorationLine: underline`, `textDecorationColor: var(--green)`, `textUnderlineOffset: 3px`. Hover: `color: var(--text)`. Label: `[↩] Save`. Clicking calls `onSave({ title, year, imdbId, plot })` (wired to mutation in production) then exits to view mode.

#### Keybinds in edit mode

- **ESC:** Calls `onEditChange(false)` (cancel without saving).
- **Ctrl+Enter or Cmd+Enter:** Calls `onSave(...)` (save and exit).

#### Form state reset

When the pane's `film.id` changes while in edit mode, the form state resets to match the new film's values. If the user was halfway through editing and the film switches, all unsaved changes are lost (the form re-initializes).

## Behaviour

- `onClose` triggered by the close button. Parent (Profiles or Library page) clears the `?film` URL param.
- `onEditChange(editing: boolean)` called when entering or exiting edit mode.
- `onSave(payload: { title, year, imdbId, plot })` called when the Save button is clicked in edit mode (wired to a GraphQL mutation in production).
- Body scrolls when content overflows pane height (view mode only; edit mode form does not scroll).
- Props: `film: FilmShape`, `onClose: () => void`, `onEditChange?: (editing: boolean) => void`, `onSave?: (payload) => Promise<void>`, `initialEdit?: boolean`.

## Subcomponents

### **`DetailPaneEdit` (inline edit form)**

See the Edit mode section above. A sub-component rendered only when `editing === true`. Exports no props — it is instantiated by the parent DetailPane with its internal state fully managed.

## Changes from Prerelease

- **Component extraction:** OLD — the detail pane was an inline component defined inside each page file (`FilmDetailPane` in `Dashboard.tsx`, `DetailPane` in `Library.tsx`). NEW — standalone component at `design/Release/src/components/DetailPane/`. The `Prerelease behavioural reference` for this spec is both page files.
- **Poster hero:** OLD — 200px hero area with `background: film.gradient` (CSS gradient string, no real image). NEW — `<Poster>` component fills the 220px hero area with a real OMDb JPG (`film.posterUrl`), falling back to a gradient placeholder.
- **Film model:** OLD — `Film.gradient: string` drives the hero background; no `posterUrl`. NEW — `Film.posterUrl: string | null` is passed to `<Poster>`; `gradient` field removed.
- **Colour identity:** OLD — resolution badge uses `badgeRed` class (red chip). NEW — resolution chip uses `class="chip green"` (green chip). CTA link text is white-on-green instead of white-on-red.
- **Border colour:** OLD — `colorBorder: "#222222"`. NEW — `colorBorder: "#25302a"`.
- **Re-link state:** OLD — `linking` state was URL-encoded in Dashboard (`?linking=true` param, reset when switching films). In Library's inline `DetailPane`, `linking` was local state. NEW — Release `DetailPane` component uses internal `editing` state. When `editing === true`, the form is displayed. The URL-encoding behaviour from Dashboard is not reproduced; edit mode is managed via props + callbacks.
- **Edit mode (2026-05-02):** NEW — DetailPane now supports a toggle into an inline edit form with four fields (Title / Year / IMDb ID / Plot) + a footer with `[ESC] Cancel` + `[↩] Save` buttons. The form state resets when the selected film changes. This is controlled via `initialEdit` prop (mount in edit mode) and `onEditChange` callback (parent syncs URL state if desired, though in Profiles the URL is `?film=<id>&edit=1` driven; in Library the pane is not edit-enabled since it's in an overlay).
- **Body content parity:** The structural sections (action row, title, eyebrow, chip row, IMDb+on-disk row, plot, cast, file info box) are unchanged between Prerelease and Release. Exact font sizes and padding values are the same.

## TODO(redesign)

- The `● ON DISK` indicator is hard-coded green; should reflect actual file presence via the `Film` model.
- Production wiring: form validation (Year must be a number; IMDb ID pattern; Plot length limits) is deferred to the GraphQL mutation + resolver layer.

## Porting checklist (`client/src/components/DetailPane/`)

- [ ] 220px hero with Poster + bottom-fade gradient + 26×26 close button
- [ ] `border-left: 1px solid border`, `background: bg-1`, full-height column
- [ ] View mode: action row with two `textAction`-styled links in flex row `columnGap: 18px` — Play link (`<Link>` to `/player/:id`) + Edit button
- [ ] Play link: green Mono underline text with white-on-hover transition
- [ ] Edit button: white Mono underline text with hover-to-green transition; click calls `onEditChange(true)`
- [ ] Title in Anton 32px uppercase (with `"Unmatched file"` fallback)
- [ ] Eyebrow row: year · genre · duration in Mono uppercase
- [ ] Chip row: resolution (green chip) + HDR + codec + audio chips
- [ ] IMDb badge + rating + on-disk dot
- [ ] Plot paragraph (when present)
- [ ] CAST section (when present) using `chip` utility
- [ ] FILE info box: filename + size · bitrate · frameRate · container in Mono
- [ ] Body scrolls (`overflow-y: auto`) when content exceeds pane height in view mode
- [ ] **Edit mode: render `<DetailPaneEdit>` when `editing === true`** 
  - [ ] Four fields: Title, Year, IMDb ID, Plot (textarea)
  - [ ] Field styling: `backgroundColor: rgba(232, 238, 232, 0.05)`, `border: 1px solid border-soft`, `borderRadius: 3px`, padding `8px 12px`
  - [ ] Field focus: `borderColor: border`, `outline: none`
  - [ ] Form footer: two buttons — `[ESC] Cancel` (muted text) + `[↩] Save` (green text)
  - [ ] Cancel button click: `onEditChange(false)` (no save)
  - [ ] Save button click: `onSave({ title, year, imdbId, plot })` then exit
  - [ ] ESC keybind in form: cancel (no save)
  - [ ] Ctrl/Cmd+Enter keybind in form: save and exit
  - [ ] Form state resets when `film.id` changes
- [ ] Close button calls `onClose` (parent clears `?film` URL param)
- [ ] Accept props: `initialEdit?: boolean` (mount in edit mode), `onEditChange?: (editing: boolean) => void` (exit mode callback), `onSave?: (payload) => Promise<void>` (save callback)
- [ ] Wire to actual GraphQL `Film` model (replace mock data)

## Status

- [x] Designed in `design/Release` lab — Edit mode with inline form added 2026-05-02 (follow-up to PR #48). View mode action row has Play + Edit buttons (distinct text-link styles: green for Play, faint white with green hover for Edit). Edit mode renders a form with Title / Year / IMDb ID / Plot fields + footer with `[ESC] Cancel` + `[↩] Save` buttons. Form state resets on film-id change. Mode toggled via `initialEdit` prop + `onEditChange` callback; `onSave` callback wired to production mutation.
- [ ] Production implementation
