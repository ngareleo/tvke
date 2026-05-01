# AppHeader

> Status: **done** (Spec) · **not started** (Production) · last design change **2026-05-01** (PR #46 commit 787f136)

## Files

- `design/Release/src/components/AppHeader/AppHeader.tsx`
- `design/Release/src/components/AppHeader/AppHeader.styles.ts`
- Prerelease behavioural reference: `design/Prerelease/src/components/AppHeader/`

## Purpose

Top header strip — brand wordmark on the left, three centred navigation links, and a right cluster (icon-only scan button + avatar). Lives inside [`AppShell`](AppShell.md), spans the single grid column. **The search form that previously lived here has moved to the Library/home page.**

## Visual

### Header shell

- `gridArea: head`, `position: relative`, `zIndex: 10`.
- **Three-column grid:** `gridTemplateColumns: 1fr auto 1fr` — brand cell on the left (`1fr`), centred nav links (`auto`), right cluster (`1fr`).
- **Glass treatment:**
  - `backgroundImage: linear-gradient(180deg, rgba(20,28,24,0.55) 0%, rgba(8,11,10,0.78) 100%)`
  - `backgroundColor: rgba(8,11,10,0.62)` (fallback under the gradient)
  - `backdropFilter: blur(20px) saturate(1.6)` (+ `-webkit-` prefix)
  - `borderBottom: 1px solid rgba(37,48,42,0.45)` — soft division from main
  - `boxShadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.18), 0 6px 22px rgba(0,0,0,0.42)` — top sheen + bottom shadow
- The header is a sibling row in the AppShell grid (not absolute over main); `backdrop-filter` is therefore cosmetic only.

### Brand cell (left column)

- `paddingLeft: 24px`, `justifySelf: start`, `alignSelf: center`.
- `<Link to="/">` with `aria-label="Xstream — home"`.
- Font: **Bytesized**, 34px.
- Two spans: the brand wordmark rendered in the Bytesized typeface at `color: var(--text)`. (The prior green `X` / `stream` split has been consolidated into a single wordmark.)

### Nav links (centre column)

- Three `<NavLink>` elements: **Home** (`/`), **Profiles** (`/profiles`), **Watchlist** (`/watchlist`).
- Font: **Jersey 25**, 26px.
- `gap: 32px` between links (or equivalent).
- At rest: `color: var(--text-muted)`.
- Active state: `color: var(--green)` + `::after` pseudo-element underline (not `text-decoration`).
  - `::after`: `content: ""`, `position: absolute`, `bottom: -4px` (approx), `left: 0`, `right: 0`, `height: 2px`, `backgroundColor: var(--green)`.
  - The link container is `position: relative` to anchor the pseudo-element.
- `NavLink` `end` prop set for `/` so it does not stay active on child routes.

### Right cluster (right column)

- `justifySelf: end`, `alignSelf: center`, `paddingRight: 24px`.
- `display: flex`, `gap: 12px`, `alignItems: center`.

#### Scan button (icon-only)

- 22×22 `<IconRefresh>`, wrapped in a `<button>`.
- `backgroundColor: transparent`, no border, no outline.
- `color: var(--text-muted)` at rest; `color: var(--green)` on hover.
- On click: sets `scanning = true`, `setTimeout(() => setScanning(false), 2000)`.
- While `scanning`: icon gets a spinning animation (`animationName: { to: { transform: "rotate(360deg)" } }`, 1.1s linear infinite) for approximately 2s.
- `aria-busy={scanning}`.
- Production: replace the `setTimeout` with a `scanLibraries` mutation.

#### Avatar

- 34×34 button.
- `border-radius: 4px` on each corner.
- `background: linear-gradient(140deg, ${colorGreenDeep}, ${colorGreen})`, `color: tokens.colorGreenInk`, `font-weight: 700`.
- Displays `user.initials` (two-letter string).
- Same gradient + initials shape as the former Sidebar user-row avatar, now promoted to the header.

## Behaviour

### Nav active state

- Managed by React Router's `<NavLink>`. When a link is active, its CSS class receives the active variant which adds the `::after` underline and flips text colour to green.
- `/` link uses `end` prop so it does not stay active when on `/profiles` or `/watchlist`.

### Scan button click

- Calls `handleScan()`. If already `scanning`, no-op.
- Sets `scanning = true`, `setTimeout(() => setScanning(false), 2000)`.
- `<IconRefresh>` gets the spinning class.
- `aria-busy={scanning}` on the button.

## Tokens used

- `tokens.fontDisplay` — `"'Bytesized', system-ui, sans-serif"` (brand wordmark)
- `tokens.fontNav` — `"'Jersey 25', system-ui, sans-serif"` (nav links)
- Both fonts loaded via Google Fonts in `design/Release/index.html`.

## Accessibility

- Brand link: `aria-label="Xstream — home"`.
- Scan button: `aria-busy={scanning}`.
- Avatar button: `aria-label` for the user identity (e.g. `aria-label="Account — {user.initials}"`).
- Nav links: standard React Router `<NavLink>`; active state conveyed via colour change and `::after` underline (not `aria-current` override needed — NavLink sets it automatically).

## Porting checklist (`client/src/components/AppHeader/`)

- [ ] Three-column grid: `1fr auto 1fr`
- [ ] Glass treatment: gradient + backdrop-filter + inner highlight + drop shadow (same values as prior spec)
- [ ] Brand cell left-aligned, `paddingLeft: 24px`, Bytesized 34px font
- [ ] Brand link `aria-label="Xstream — home"` as a `<Link to="/">`
- [ ] Three `<NavLink>` centred: Home `/` (with `end`), Profiles `/profiles`, Watchlist `/watchlist`
- [ ] Nav font: Jersey 25, 26px
- [ ] Nav active: `color: var(--green)` + `::after` pseudo-element underline (not `text-decoration`)
- [ ] Nav `::after` anchored by `position: relative` on the link container
- [ ] `tokens.fontDisplay` (`'Bytesized'`) and `tokens.fontNav` (`'Jersey 25'`) registered in token file
- [ ] Both Google Fonts loaded in HTML `<head>` (Bytesized + Jersey 25)
- [ ] Right cluster: `justifySelf: end`, flex row, gap 12px
- [ ] Scan button: 22×22 `<IconRefresh>`, icon-only (no text label), transparent bg, no border
- [ ] Scan icon spins (~2s) on click while `scanning`; `aria-busy` toggled
- [ ] Scan button wired to `scanLibraries` mutation (replaces 2s mock timer)
- [ ] Avatar: 34×34 button, `border-radius: 4px`, green-deep→green gradient, green-ink initials
- [ ] No search form in the header (search moved to Library/home page)

## What changed from the prior spec (787f136)

The prior AppHeader spec described the search-centric layout: a three-column grid keyed to `${tokens.sidebarWidth} 1fr auto`, a full search form with suggestions dropdown, caret animation, and mirror span, and a text-label scan button. All of that is superseded:

- **Grid** changed from `${tokens.sidebarWidth} 1fr auto` to `1fr auto 1fr`.
- **Search form, suggestions dropdown, custom caret, mirror span** — deleted from the header; now live on the Library/home page in a simpler form.
- **Scan trigger** — was a text button (`"Scan"` / `"Scanning…"` in JetBrains Mono); now an icon-only button (22×22 `<IconRefresh>`).
- **Brand** — was Anton 26px with `X` in green; now Bytesized 34px single wordmark.
- **Nav links** — were absent from the header (navigation was in the Sidebar); now three centred Jersey 25 links with `::after` underline for active state.
- **Avatar** — was in the Sidebar user-row; now in the header right cluster (34×34 instead of 30×30).

The glass treatment, scan spin animation, and `aria-busy` pattern are unchanged.

## Status

- [x] Designed in `design/Release` lab — full rewrite (2026-05-01, PR #46 commit 787f136, `feat/release-design-omdb-griffel`, not yet merged to main)
- [ ] Production implementation
