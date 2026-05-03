# Goodbye (page)

> Status: **baseline** (Spec) · **done** (Production)

## Files

- `design/Release/src/pages/Goodbye/Goodbye.tsx`
- `design/Release/src/pages/Goodbye/Goodbye.styles.ts`
- Prerelease behavioural reference: `design/Prerelease/src/pages/Goodbye/`

## Purpose

Sign-out farewell, full-screen (`/goodbye`). **Bypasses [`AppShell`](AppShell.md)** — owns its own viewport. Auto-redirects to `/` after 4 seconds.

## Visual

### Outer container
- `width: 100vw`, `height: 100vh`, `background: var(--bg-0)`, `position: relative`, `overflow: hidden`, `color: var(--text)`.

### Layered atmosphere (bottom to top)
1. `.grain-layer` utility, `opacity: 0.22`.
2. Radial green glow: `radial-gradient(ellipse at center, var(--green-soft) 0%, transparent 55%)`, `pointer-events: none`.
3. **Ghost watermark**: `font-size: 30vw`, Anton, `opacity: 0.03`, `letter-spacing: -0.04em`, content `"GOODBYE"`. `aria-hidden`, no select/pointer.
4. Centred content stack (z-index: 2).

### Centred content
- Flex column, centred, `gap: 18`, `padding: 24`.
- **`<Logo02 size={64} showWordmark={false} />`** at `opacity: 0.6`.
- Eyebrow `· SESSION ENDED` in green.
- Display: Anton 64px, `line-height: 0.95`, `letter-spacing: -0.01em`, uppercase — `"See you next time, {user.name}."`.
- Body line: `color: var(--text-dim)`, max-width 460 — `"Your library will be right here when you get back."`.
- Action row (`margin-top: 12`):
  - **Back to home button**: `background: var(--green)`, `color: var(--green-ink)`, no border, `padding: 10px 22px`, JetBrains Mono 11 / 0.18em / uppercase / 700, `border-radius: 2px`. Calls `navigate("/", { replace: true })`.
  - **Countdown text**: Mono 11 / `text-muted` / 0.1em — `"Redirecting in {countdown}s…"`.

## Behaviour

### Auto-redirect timer
- `REDIRECT_DELAY = 4` seconds.
- `useState(REDIRECT_DELAY)` → `useEffect` runs on every `countdown` change:
  - If `countdown <= 0` → `navigate("/", { replace: true })`, return.
  - Otherwise schedule `setTimeout(() => setCountdown(c => c - 1), 1000)`, returning the cleanup.
- Effect dep array: `[countdown, navigate]`.

### Manual redirect
- Back button calls `navigate("/", { replace: true })` immediately. (Replace so back-button doesn't return to `/goodbye`.)

### Known artefact
- React StrictMode double-invokes the initial `useEffect`, so the visible countdown can decrement twice on mount (1 second feels skipped). Minor; left as-is.

## Subcomponents

None.

## Changes from Prerelease

- **Brand mark:** OLD — `<LogoShield>` SVG (shield mark, `width: 44, height: 52`, `opacity: 0.5`). NEW — `<Logo02 size={64} showWordmark={false} />` (stacked X monogram, `opacity: 0.6`).
- **Primary CTA colour:** OLD — `btnRed` class — `background: var(--red)`, `color: var(--white)` (crimson). NEW — `background: var(--green)`, `color: var(--green-ink)` (dark green ink on green).
- **Design language:** OLD — grain + radial gradient glow + ghost watermark "GOODBYE" (all present in Prerelease). NEW — identical atmospheric layers retained; only the colour token driving the glow and CTA changes.
- **Timer logic:** Identical in both labs — `REDIRECT_DELAY = 4`, `countdown` state decrements 1/s, both manual and auto navigation use `replace: true`. StrictMode artefact is unchanged.
- **Route and shell bypass:** Identical — `/goodbye`, bypasses AppShell in both labs.
- **No structural change** beyond brand mark + colour identity.

## TODO(redesign)

- The countdown StrictMode artefact could be cleaned up by keying the timer off `Date.now()` rather than incremental state. Confirm whether this matters in production (StrictMode may not be enabled).
- Sign-out wiring — currently `Goodbye` is reached only by directly visiting `/goodbye`. Production needs a sign-out button (likely in [`Sidebar`](Sidebar.md)) that calls a logout mutation then navigates here.

## Porting checklist (`client/src/pages/goodbye-page/`)

- [x] Bypass AppShell — full viewport, `bg-0` background
- [x] Grain layer at 0.22 opacity
- [x] Radial green-soft glow centred
- [x] Ghost watermark "GOODBYE" at 30vw / 0.03 opacity / Anton
- [x] Centred Logo02 (64px, no wordmark) at 0.6 opacity
- [x] Eyebrow `· SESSION ENDED` in green
- [x] Display title Anton 64px uppercase
- [x] Body line max-width 460
- [x] Back-to-home button: green bg, green-ink text, JetBrains Mono uppercase
- [x] Countdown text auto-decrements every second
- [x] Auto-redirect to `/` (via `replace: true`) when countdown hits 0
- [x] `replace: true` on both manual + auto navigation (no back-button trap)
- [ ] Wire from sign-out mutation in production (deferred — `/goodbye` still reached only by direct visit; AccountMenu sign-out wiring lives in a future milestone)

## Status

- [x] Designed in `design/Release` lab (baseline reflects current state)
- [x] Production implementation (M9, 2026-05-03). `client/src/pages/goodbye-page/` rewrite: swaps `LogoShield` for `Logo02` (size 64, no wordmark, opacity 0.6), promotes the redirect timer from a static one-shot `setTimeout` to a `useState(REDIRECT_DELAY)` countdown (decrements 1/s; auto-navigates `replace: true` when it hits 0), drops the legacy `colorWhite/colorMuted/colorRedDark` token call sites in favour of `colorGreen` + `colorGreenInk` + `colorGreenSoft`, layers the shared `.grain-layer` utility at 0.22 opacity, and renders the Anton 64px title above a Mono 11px countdown. `GoodbyePage.strings.ts` adopts a `formatString(redirectingFormat, { n })` interpolation so the countdown number stays a single source of truth.
