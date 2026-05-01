# AppShell

> Status: **done** (Spec) · **not started** (Production) · last design change **2026-05-01** (PR #46 commit 787f136)

## Files

- `design/Release/src/components/Layout/AppShell.tsx`
- `design/Release/src/components/Layout/AppShell.styles.ts`
- Prerelease behavioural reference: `design/Prerelease/src/components/Layout/`

## Purpose

The two-row shell that hosts the header and routed page content. Wraps every shelled page (Home/Library, Profiles, Watchlist, Settings, DesignSystem, NotFound). The Player and Goodbye pages bypass it. **The sidebar has been removed; the shell is now a single-column layout.**

## Visual

- Grid:
  - `gridTemplateColumns: 1fr` (single column — sidebar dropped)
  - `gridTemplateRows: ${tokens.headerHeight} 1fr` (52px header + flexible main)
  - `gridTemplateAreas: '"head" "main"'` (header row, then main row)
- Dimensions: `width: 100vw`, `height: 100vh`, `overflow: hidden`.
- `backgroundColor: tokens.colorBg0` (`#050706`).
- `color: tokens.colorText` (`#e8eee8`).
- `position: relative` (so descendant absolutes anchor here).

## Behaviour

- Composition only — renders `<AppHeader>` then `<main className={s.main}>{children}</main>`.
- `main` has `gridArea: main`, `overflow: hidden`, `position: relative` so pages can manage their own scroll/overlay positioning.
- `<Sidebar>` is no longer rendered here. Navigation lives in `<AppHeader>`.

## Subcomponents

None.

## What changed from the prior spec (787f136)

The prior AppShell spec described a two-column layout:
- `gridTemplateColumns: ${tokens.sidebarWidth} 1fr` (220px sidebar + flexible main)
- `gridTemplateAreas: "head head" "side main"` (header spanning both columns, sidebar in left rail)
- Composition included `<AppHeader>`, `<Sidebar>`, `<main>`.

All of that is superseded. The sidebar directory (`design/Release/src/components/Sidebar/`) has been deleted. Navigation now lives in the header. See [`AppHeader.md`](AppHeader.md) for the three-link nav and [`Sidebar.md`](Sidebar.md) for the tombstone record.

The `TODO(redesign)` about overlay-glass (drop the head row and absolute-position the header) is still valid if a future iteration wants true glass — the new single-column grid has the same constraint.

## Porting checklist (`client/src/components/Layout/AppShell/`)

- [ ] Grid template: `gridTemplateColumns: 1fr`, `gridTemplateRows: ${tokens.headerHeight} 1fr`, `gridTemplateAreas: '"head" "main"'`
- [ ] Full-viewport (100vw × 100vh), `overflow: hidden`
- [ ] `colorBg0` background, `colorText` foreground
- [ ] `position: relative` on the shell so descendants can `position: absolute`
- [ ] Composition: `<AppHeader>` + `<main>` slot only (no `<Sidebar>`)
- [ ] `main` gets `gridArea: main`, `overflow: hidden`, `position: relative` (each page handles its own scroll)

## Status

- [x] Designed in `design/Release` lab — sidebar removed, single-column grid (2026-05-01, PR #46 commit 787f136, `feat/release-design-omdb-griffel`, not yet merged to main)
- [ ] Production implementation
