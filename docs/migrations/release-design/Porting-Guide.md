# Release-Design Port — Agent Porting Guide

> **Read this file first, every milestone.** It is the load-bearing how-to
> for the agents porting `design/Release/` into `client/src/`. The shared
> roster (milestone status, hand-off notes, decision log) lives in the
> repo at [`Plan.md`](Plan.md) so every agent picks up a current copy on
> branch checkout. `migrations-lead` reads `Plan.md` to brief each
> milestone agent and ticks its checklist as work lands.

---

## What this guide is for

The Release-design migration is a sequential, single-PR port driven by
stateless agents. To survive the hand-offs, every agent needs the same
mental model: invariants that must not break, file conventions per
component, helpers introduced for this migration, and the cross-cutting
contracts that bind milestones together.

This file is the contract. The companion `Schema-Changes.md` is the
schema-side contract for M2 and its consumers. Together with the
per-component specs under `Components/`, they are the agent's only
in-repo brief.

If anything in this guide disagrees with `docs/code-style/`,
`docs/code-style/` wins — open an issue and update this guide. If anything
disagrees with the lab (`design/Release/`), the lab wins for visuals and
behaviour, and the relevant per-component spec gets updated.

---

## Engineering invariants — the never-violate list

These are sourced from `docs/code-style/` and the migration plan. They
are the rules an agent's port must respect. Violating any of them
silently corrupts behaviour or breaks reviewer trust.

### 1. Relay fragments

- `useLazyLoadQuery` lives **only in pages** (`client/src/pages/<page>/<Page>.tsx`).
  Components never call it.
- Components consume fragments named `<ComponentName>_<propName>`,
  e.g. `FilmDetailPane_video`, `Library_libraries`.
- Fragments are colocated with the component file via a `graphql`
  tagged template inside the same `.tsx`. The Relay compiler emits the
  generated artifact under `client/src/relay/__generated__/` — never
  edit those by hand; they regenerate.
- Suspense boundaries belong on pages. Components assume their fragment
  data is present.

Reference: `docs/architecture/Relay/00-Fragment-Contract.md`.

### 2. Griffel styles

- Every component has a colocated `<Name>.styles.ts` exporting
  `useStyles()` from `makeStyles({...})`.
- Class names are applied via `mergeClasses` (or returned class strings
  directly) — **never inline `style={{ ... }}` props** except for
  truly dynamic values: drag-pane width, view-transition names, hero
  3D-tilt transforms.
- All values inside `makeStyles` come from `~/styles/tokens.ts`. No
  hard-coded hex, spacing, font, or radius literals.

### 3. Nova eventing

- Every interactive component owns a colocated `<Name>.events.ts` that
  exports event creators + originator constants.
- User interactions emit events through `useNovaEventing()`; components
  never call services directly.
- Event types follow the existing convention: an originator constant
  (`FILM_DETAIL_PANE_ORIGINATOR = "FilmDetailPane"`), a discriminated
  type union (`...EventTypes = { CLOSED: "Closed", ... } as const`),
  one factory per event (`createFilmDetailPaneClosedEvent()`), one
  predicate per event (`isFilmDetailPaneClosedEvent(wrapper)`).

### 4. Imports

- All cross-module imports use the `~/` alias.
- Relative `../` is banned by lint. Same-directory `./` is fine.
- Type-only imports use `import type`.

### 5. No non-null assertions

- `!` is forbidden in production code. Use `?.`, narrow with a guard,
  or rethink the contract.
- Tests post-`expect(...).toBeDefined()` may use `!` (linter exception).

### 6. Tokens only

- `import { tokens } from "~/styles/tokens.js"` and use `tokens.colorGreen`,
  `tokens.fontHead`, etc.
- For values that must live in CSS (font-face, CSS custom properties
  consumed by global styles), use `client/src/styles/shared.css` and the
  matching `:root { --green: oklch(...); }` variable.

### 7. Heroicons through the wrapper

- `import { IconPlay, IconRefresh, ... } from "~/lib/icons.js"` only.
- Direct imports from `@heroicons/react/...` are forbidden. The wrapper
  pins size + `currentColor` and lets us switch the underlying lib.

### 8. Strings — colocated `.strings.ts`

- Every component has `<Name>.strings.ts`. Only English at this stage.
- Use `react-localization` like the existing convention:

  ```ts
  import LocalizedStrings from "react-localization";

  export const strings = new LocalizedStrings({
    en: {
      play: "Play",
      reLink: "Re-link",
      // ...
    },
  });
  ```

- Components consume via `import { strings } from "./<Name>.strings.js"`
  then `<button>{strings.play}</button>`.
- Brand wordmark "Xstream" lives in `app-header.strings.ts`. Don't repeat
  it elsewhere.

### 9. Stories — `<Name>.stories.tsx` per ported component

Every ported component ships a story file, even if simple. Use the
existing decorators:

- `withNovaEventing` (always, when the component dispatches Nova events)
- `withRelay` (when the component consumes a fragment)
- `withLayout` (when the story needs the AppShell wrapper around it)

Minimal template (no Relay):

```tsx
import React from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { withNovaEventing } from "~/storybook/withNovaEventing.js";

import { FilmTile } from "./FilmTile.js";

const meta: Meta<typeof FilmTile> = {
  title: "Components/FilmTile",
  component: FilmTile,
  decorators: [withNovaEventing],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof FilmTile>;

export const Default: Story = {
  args: {
    /* ... */
  },
};
```

Fragment template — see
`client/src/components/film-detail-pane/FilmDetailPane.stories.tsx` for
a working example with `mockResolvers` + `getReferenceEntry`.

### 10. Tests — `__tests__/` only when there is pure logic

- Tests live in `__tests__/` subfolders next to the source. Never as
  sibling `*.test.ts`.
- Only port + write tests for **extracted pure logic**: `filters.ts`
  (FilterSlide), `filmMatches` (Profiles), schema mappers (M2). Don't
  unit-test components — the stories cover that surface; e2e covers
  flows.

### 11. View transitions — go through the helper

`document.startViewTransition()` is wrapped by:

```ts
// client/src/utils/viewTransition.ts (created in M1)
export function withViewTransition(fn: () => void): void {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(fn);
    return;
  }
  fn();
}
```

- Always call `withViewTransition(fn)`, never `document.startViewTransition(fn)`
  directly.
- The morph contract uses the `viewTransitionName` CSS property. The
  Library overlay's poster carries `viewTransitionName: "film-backdrop"`
  (M4); the Player backdrop carries the same name (M7). Don't change
  the literal — it's the cross-milestone contract.

### 12. Playback is OFF-LIMITS

The streaming pipeline ships unchanged in this PR. The backend lives in
**Rust** (`server-rust/`) as of 2026-05-02; the Bun tree (`server/`) is
retired for new feature work and not the target of any release-design
edit. **No agent may modify**:

- `client/src/services/*.ts` (BufferManager, ChunkPipeline,
  PlaybackController, etc.)
- `client/src/hooks/useChunkedPlayback.ts`
- `client/src/hooks/useVideoPlayback.ts`
- `client/src/hooks/useVideoSync.ts`
- `server-rust/src/services/chunker.rs`, `ffmpeg_file.rs`,
  `ffmpeg_pool.rs`, `hw_accel.rs`
- `server-rust/src/routes/stream.rs`
- The retired Bun mirror under `server/src/services/` and
  `server/src/routes/stream.ts` is also off-limits — no Bun edits at all.

Only the **wrapping** changes: Player chrome, side panel, controls
layout, SeasonsPanel for series, view transitions, episode-driven URL
state. If a milestone task forces a change to one of the above files,
**stop and escalate via `migrations-lead`** — do not modify silently.

### 13. One PR, one branch

- All milestones land on the same branch (`release-design`) in the
  same worktree (`../xstream-release-design`).
- Push after every milestone; the next agent picks up a clean working
  tree.
- Never open a second PR. If a milestone uncovers an "obviously
  separable" change, raise it with `migrations-lead`; the default is
  to keep it on this branch.

---

## Token mapping — Prerelease (Moran) → Release (Xstream)

This table is the source of truth for M1's `tokens.ts` rewrite. Every
existing consumer of a Prerelease token will fall into one of four
buckets: replaced, dropped, renamed, or unchanged. Any token *removed*
from the new file should fail the type-check at every call site — the
M1 agent annotates each failing site with `// release-design: consumed
in M{n}` so later milestones know who owns the cleanup.

| Prerelease token | Release equivalent | Notes |
|---|---|---|
| `colorRed` | **dropped** | All red surfaces become green. Active rows, badges, CTAs flip to `colorGreen` / `colorGreenSoft` / `colorGreenDeep`. |
| `colorRedDark` | **dropped** | Use `colorGreenDeep`. |
| `colorRedDim` | **dropped** | Use `colorGreenSoft` (`oklch(0.78 0.20 150 / 0.12)`). |
| `colorRedBorder` | **dropped** | Use `colorBorder` or `colorBorderSoft`. |
| `colorBlack` | `colorBg0` (`#050706`) | Slightly green-tinted black. |
| `colorSurface` | `colorSurface` (`#14181a`) | Same name; different value. |
| `colorSurface2` | `colorSurface2` (`#1a1f1c`) | Same name; different value. |
| `colorSurface3` | **dropped** | If a third surface tier is needed, layer with `colorBorderSoft` overlays instead. |
| `colorBorder` | `colorBorder` (`#25302a`) | Same name; different value. |
| `colorBorder2` | **dropped** | Replace with `colorBorderSoft` (`rgba(37, 48, 42, 0.5)`). |
| `colorWhite` | `colorText` (`#e8eee8`) | The Release "white" is a soft green-tinted off-white. |
| `colorOffWhite` | `colorText` | Same as above; the Prerelease pair collapses to one. |
| `colorMuted` | `colorTextMuted` (`#6a766f`) | Renamed; closer to a darker green-grey. |
| `colorMuted2` | `colorTextFaint` (`#46504b`) | Renamed. |
| `colorGreen` | `colorGreen` (`oklch(0.78 0.20 150)`) | Same name; **value moves from `#27AE60` to oklch primary**. |
| (n/a) | `colorGreenDeep` (`oklch(0.45 0.13 150)`) | New — use for hover-darken or pressed states. |
| (n/a) | `colorGreenSoft` (`oklch(0.78 0.20 150 / 0.12)`) | New — selected-row tint. |
| (n/a) | `colorGreenGlow` (`oklch(0.78 0.20 150 / 0.35)`) | New — hover shadow / glow. |
| (n/a) | `colorGreenInk` (`#050706`) | New — text colour on a green-filled surface. |
| (n/a) | `colorBg1` (`#0a0d0c`) | New — secondary background tier. |
| (n/a) | `colorTextDim` (`#9aa6a0`) | New — for breadcrumb leading segments etc. |
| `colorYellow` | `colorYellow` (`#f5c518`) | Same; used for IMDb badge + unmatched match-bar. |
| (n/a) | `colorRed` (`#ff5d6c`) | Repurposed: error/destructive accent only (not the brand). |
| `fontHead` | `'Anton', sans-serif` | **Bebas Neue → Anton.** Update every `tokens.fontHead` consumer transparently. |
| `fontBody` | `'Inter', sans-serif` | Unchanged. |
| `fontMono` | `'JetBrains Mono', ui-monospace, monospace` | Slight stack tweak; consumers unchanged. |
| (n/a) | `fontDisplay` (`'Bytesized', ...`) | New — brand wordmark only (AppHeader). |
| (n/a) | `fontNav` (`'Science Gothic', ...`) | New — AppHeader nav links only. |
| `radiusSm` | `radiusSm` (`2px`) | Same name; **4px → 2px**. |
| `radiusMd` | `radiusMd` (`4px`) | Same name; **8px → 4px**. |
| `radiusLg` | **dropped** | Release uses `radiusFull` for pills, otherwise stays at `radiusMd`. |
| `radiusFull` | `radiusFull` (`999px`) | Same. |
| `space1`–`space4` | unchanged (`4 / 8 / 12 / 16`) | — |
| `space5` | `space5` (`24px`) | **20px → 24px**. |
| `space6` | `space6` (`32px`) | **24px → 32px**. |
| `transition`, `transitionSlow` | unchanged | `0.15s` / `0.25s`. |
| `headerHeight`, `sidebarWidth`, `sidebarCollapsedWidth` | unchanged | — |
| `rightPaneWidth` | **dropped** | Profiles uses `useSplitResize` with a 50%-of-viewport default. |
| `playerPanelWidth` | **dropped** | Player panel width is now derived per-spec; no shared token. |

The M1 agent runs the type-check after replacing `tokens.ts` and
follows up on each failing import:

- If the consumer is in a milestone landing this PR, leave a comment
  `// release-design: consumed in M{n}` predicting where it lands.
- If the consumer is in a file the milestone owns directly (M1 deletes
  the consumer in the same commit), do that.
- If the consumer is in `client/src/services/` or any "out of scope"
  path, **escalate** — the playback layer should not consume removed
  tokens.

---

## Migration helpers — what each milestone introduces

Helpers added by this migration that later milestones consume. Documented
once here so agents don't re-derive contract.

### `withViewTransition(fn)` — added in M1

`client/src/utils/viewTransition.ts`. Wraps `document.startViewTransition`
with a feature-detect + no-op fallback. Used by:

- M4 (Library tile → FilmDetailsOverlay open / Player navigation)
- M7 (Player back-nav, episode swap)

### `~/styles/shared.css` utility classes — added in M1

Imported once in `main.tsx`. Provides:

- `.eyebrow` — uppercase mono micro-label.
- `.chip` — pill-shaped chip used by FilterSlide + DetailPane.
- `.grain-layer` — fixed-position grain overlay for Library hero, Player
  backdrop, Goodbye, NotFound.
- `.dot` — bullet separator (1px green dot).

### `PROFILE_GRID_COLUMNS` — added in M5

`client/src/pages/profiles-page/grid.ts`:
`export const PROFILE_GRID_COLUMNS = "30px 1.3fr 0.7fr 0.6fr 80px"`.
Imported by `ProfileRow.styles.ts` and `FilmRow.styles.ts` so column
widths stay locked together.

### `<Poster>` — added in M4

Lowest-level reusable. `<Poster src={url} alt={...} className={geometry}>`.
Geometry is caller-controlled via `className` — the component does not
accept inline `style` (intentional).

### `<SeasonsPanel>` — added in M7

Stubbed in M5 (DetailPane + FilmRow inline expansion); real component
lands in M7. Prop contract:

```ts
interface SeasonsPanelProps {
  seasons: Season[];
  defaultOpenFirst?: boolean;     // default false
  accordion?: boolean;             // default false; Player passes true
  activeEpisode?: { seasonNumber: number; episodeNumber: number };
  onSelectEpisode?: (seasonNumber: number, episodeNumber: number) => void;
}
```

When stubbing in M5, render a single-line "Seasons coming in M7"
placeholder with the same prop signature so the M7 swap is import-only.

---

## Multi-spec milestones — where to look beyond a single component

Some milestones span many specs. Read every one before starting; the
table below lists the first-pass set per milestone.

| Milestone | Specs to read first | Lab paths |
|---|---|---|
| M3 | AppShell, AppHeader, AccountMenu, Sidebar (tombstone) | `design/Release/src/components/{Layout,AppHeader,AccountMenu}/` |
| M4 | Library, FilmDetailsOverlay, SearchSlide, FilterSlide, PosterRow, FilmTile, MediaKindBadge, Poster | `design/Release/src/pages/Library/` + `design/Release/src/components/{FilmDetailsOverlay,SearchSlide,FilterSlide,PosterRow,FilmTile,MediaKindBadge,Poster}/` |
| M5 | Profiles, ProfileRow, FilmRow, EdgeHandle, DetailPane, CreateProfile, EditProfile, ProfileForm, DirectoryBrowser | `design/Release/src/pages/{Profiles,CreateProfile,EditProfile}/` + `design/Release/src/components/{ProfileRow,FilmRow,EdgeHandle,DetailPane,ProfileForm,DirectoryBrowser}/` |
| M7 | Player, SeasonsPanel | `design/Release/src/pages/Player/` + `design/Release/src/components/SeasonsPanel/` |

The Cross-page sync notes in the plan file capture cross-milestone
contracts (Poster prop shape, SeasonsPanel signature, viewTransitionName
literal, `PROFILE_GRID_COLUMNS`, schema field availability). Update them
as part of the milestone's audit step before porting.

---

## Per-milestone audit step

Every milestone (except M0/M1/M2 which don't port UI specs) starts with
a spec audit. The agent:

1. **Reads** every spec listed in the milestone's "Specs to audit + port"
   section of the plan.
2. **Walks** the lab source for any spec marked `baseline` and:
   - Fills every remaining `TODO(redesign)` with the now-known value.
   - Expands the porting checklist to AppShell.md depth: one `[ ]` bullet
     per concrete CSS value or behaviour detail.
   - Adds two subsections: **Strings** (every literal user-facing string,
     so the porting agent extracts to `.strings.ts` without missing one)
     and **Stories** (which states/variants the `.stories.tsx` should
     render).
3. **Commits** the spec updates as the first commit of the milestone.
4. **Then** ports.

Spec edits that disagree with the lab fail. Lab wins.

---

## Schema delta consumption

M2 lands the schema once. Every subsequent milestone consumes via Relay
fragments only — no new schema work after M2.

If a porting agent in M3+ discovers a missing field:

1. **Stop.** The schema is meant to be one shot.
2. Document the gap in the milestone's hand-off note.
3. Open a tiny patch commit on the same branch that adds **only** the
   missing field (resolver + presenter + SDL + SQL if needed). Don't
   batch other "while we're here" changes.
4. Update `Schema-Changes.md` with the addition and tag it
   `(post-M2 patch)` so reviewers can find it.

The contract is: **M2 anticipated everything** and patches are
exception traffic, not the norm.

---

## How `migrations-lead` briefs the next agent

The orchestration playbook for `migrations-lead`. Repeat verbatim per
milestone:

1. Read the plan roster table. Find the lowest-numbered milestone that
   is `not started` or `in progress` (resume the latter).
2. Read the milestone's section in the plan: Goal, Specs, Tasks,
   Inputs, Cross-cutting notes for later milestones, Verification,
   Hand-off note for the next milestone.
3. Brief the chosen agent with this prompt structure:

   > **Migration: Release-design port (PR #N).** You are the Mn agent.
   >
   > **Goal:** {goal verbatim from plan}
   >
   > **Worktree:** `../xstream-release-design`, branch `release-design`.
   > Pull and rebase if behind.
   >
   > **Read first (in this order):**
   > - `docs/migrations/release-design/Plan.md` — the roster
   > - `docs/migrations/release-design/Porting-Guide.md` — invariants + helpers
   > - `docs/migrations/release-design/Schema-Changes.md` (if M2+ work depends on schema)
   > - The specs listed in the milestone's "Specs to audit + port" table
   >
   > **Tasks:** {paste full Tasks list verbatim}
   >
   > **Cross-cutting context:** {paste any "Cross-cutting notes for M{this}" from previous milestones; check the plan's Cross-page sync notes section}
   >
   > **Verification:** {paste Verification list}
   >
   > **When done:**
   > 1. Update the plan roster table: this milestone → `done`, record
   >    commit SHA, append the Hand-off note for M{n+1} if anything
   >    surprising surfaced.
   > 2. Commit + push.
   > 3. Notify `architect` with files-changed summary (per CLAUDE.md
   >    update protocol).

4. After the agent reports done, verify the roster was updated and the
   verification checklist actually ticked. If not, push back before
   accepting the milestone as complete.

---

## When in doubt

- **Spec disagrees with lab** → lab wins. Update the spec.
- **Spec disagrees with this guide** → this guide wins for invariants;
  the spec wins for component-specific values.
- **This guide disagrees with `docs/code-style/`** → `docs/code-style/`
  wins. File a follow-up to update this guide.
- **Cross-milestone contract is ambiguous** → the plan's Cross-page sync
  notes are the tiebreaker. If they're silent, escalate via
  `migrations-lead` rather than guessing.
- **Out-of-scope file forces a change** → stop, escalate, do not modify
  silently.

---

## Cross-references

- Plan file (out-of-repo): `docs/migrations/release-design/Plan.md`
- Migration root: `docs/migrations/release-design/README.md`
- Cross-cutting changes: `docs/migrations/release-design/Changes.md`
- Schema deltas: `docs/migrations/release-design/Schema-Changes.md`
- Component catalog: `docs/migrations/release-design/Components/README.md`
- Code-style invariants: `docs/code-style/Invariants/00-Never-Violate.md`
- Client conventions: `docs/code-style/Client-Conventions/00-Patterns.md`
- Naming conventions: `docs/code-style/Naming/00-Conventions.md`
- Anti-patterns: `docs/code-style/Anti-Patterns/00-What-Not-To-Do.md`
- Relay fragment contract: `docs/architecture/Relay/00-Fragment-Contract.md`
- Schema surface: `docs/server/GraphQL-Schema/00-Surface.md`
- DB schema: `docs/server/DB-Schema/`
