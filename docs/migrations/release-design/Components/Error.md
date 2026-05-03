# Error (page)

> Status: **baseline** (Spec) · **done** (Production)
> Spec created: 2026-05-02 — Runtime-error recovery page mockup. Styled stack trace + "back to library" + "retry" CTAs. Reachable at `/error` in the design lab for QA visibility of error states.

## Files

- `design/Release/src/pages/Error/Error.tsx`
- `design/Release/src/pages/Error/Error.styles.ts`

## Purpose

Full-page error state for runtime exceptions (e.g. failed stream load, GraphQL error, unexpected crash). The design lab mockup shows a styled red-bordered error identity, a monospaced stack trace, and two recovery CTAs. Production will wire this page to receive error data from the router and display real exception details.

## Visual

### Page layout
- Full-screen, `display: flex`, `alignItems: center`, `justifyContent: center`, `backgroundColor: tokens.colorBg1`, `paddingLeft: 80px`, `paddingRight: 24px`, `paddingTop: tokens.headerHeight` (page respects header clearance like Profiles).
- Content centred in a max-width container (ca. 560px).

### Error identity
- A red accent running vertically down the left side of the content (or a red badge in the upper corner) to signal "error state" within the green Xstream theme. `borderLeftWidth: 4px`, `borderLeftStyle: solid`, `borderLeftColor: tokens.colorRed`, `paddingLeft: 28px`.

### Headline
- "Something went wrong" in Anton 64px uppercase, `color: tokens.colorText`.
- `marginBottom: 16px`.

### Subhead / description
- 14px body font, `color: tokens.colorTextDim`, `lineHeight: 1.6`.
- Message: "An unexpected error occurred. Please try again or contact support if the problem persists." (mock placeholder text; production will display the actual error message or a user-friendly interpretation of it).
- `marginBottom: 28px`.

### Stack trace box (when visible, or as a collapsible section)
- `backgroundColor: tokens.colorSurface`, `border: 1px solid tokens.colorBorder`, `borderRadius: tokens.radiusSm`, `padding: 12px`.
- JetBrains Mono 10px, `color: tokens.colorTextDim`, `lineHeight: 1.8`.
- Multi-line monospaced stack trace (mock example):
  ```
  Error: stream not found
    at ChunkedPlayback.onChunk (playback.ts:123)
    at StreamingService.fetch (service.ts:456)
    at async useChunkedPlayback (hook.ts:89)
  ```
- Optional: collapsible toggle ("Show details" / "Hide details") with chevron icon to reveal/hide the stack.
- `marginBottom: 28px`.

### CTA buttons
- Flex row, `columnGap: 16px`, `marginBottom: 0`.
- **"← Back to Library"** (secondary): textAction style (white text + white underline), links to `/`.
- **"Retry"** (primary): textAction style (green text + green underline), triggers a retry handler (in production, re-runs the failed operation or navigates back and retries).

## Behaviour

### State
- Error message and stack trace passed via location state (from the router) or a global error context. Mockup shows placeholder text.
- Stack trace is optional; if present, it may be collapsible.

### Callbacks
- "Back to Library": `navigate("/")`.
- "Retry": calls a `handleRetry()` function (in design lab, just navigates back; production wires to the actual failed operation's retry handler).

### Production integration
- The router catches uncaught exceptions and navigates to `/error` with error details in the location state or a query param.
- A global error boundary could also render this page in-place.
- Error details (message, stack, request ID, etc.) are displayed in the stack trace box.

## Subcomponents

None.

## Changes from Prerelease

This component is new in Release — no Prerelease equivalent. Prerelease did not have an explicit error-recovery page design.

## TODO(redesign)

- Error context / location state shape: define how error details are passed to the Error page (e.g., `location.state.error`, context API, query params).
- Stack trace formatting: decide whether to show the full stack or a summarized version; consider truncation for very long stacks.
- User-friendly error messages: map technical error codes to plain-language copy (e.g. "Stream not found" → "This file couldn't be played. Try a different resolution or file.").
- Retry logic: define what "Retry" does (repeat the same operation, reload the app, navigate back, etc.).

## Porting checklist (`client/src/pages/error-page/`)

- [x] Full-screen layout, `display: flex`, centred content, `backgroundColor: colorBg1`, `paddingTop: tokens.headerHeight` (header clearance)
- [x] Red left border accent: `borderLeftWidth: 4px`, `borderLeftColor: colorRed`, `paddingLeft: 28px`
- [x] Headline: "Something went wrong" in Anton 64px uppercase
- [x] Subhead: description text (14px body font, dimmed) from error state
- [x] Stack trace box: monospaced, `backgroundColor: colorSurface`, `border: 1px solid colorBorder`, `paddingLeft: 12px` etc
- [x] Optional: collapsible stack trace ("Show details" / "Hide details") with chevron toggle
- [x] Error message and stack trace passed via props (`error: Error | null`, `componentStack: string | null`) from `ErrorBoundary`. Direct `/error` route renders without props for QA visibility (placeholder copy).
- [x] CTA buttons: "← Back to library" (white text link) + "Retry" (green text link)
- [x] "Back to library" navigates to `/` (uses `<a href="/">` rather than `<Link>` so the boundary mounted outside the Router context still works)
- [x] "Retry" calls `onRetry` prop; falls back to `window.location.reload()` when the page is rendered standalone at `/error`
- [x] Wire error boundary to render `ErrorPage` when caught (in-place render, not navigation — preserves error context and survives the Router subtree being thrown). The `/error` route exists in addition for QA visibility.

## Status

- [x] Designed in `design/Release` lab — runtime-error recovery page mockup 2026-05-02, PR #48. Red-bordered error identity, styled stack trace box, and two recovery CTAs ("Back to Library" + "Retry"). Reachable at `/error` for QA verification of error states.
- [x] Production implementation (M9, 2026-05-03). New `client/src/pages/error-page/ErrorPage.tsx` accepts `{ error?, componentStack?, onRetry? }`. Mounted in two places: (1) `ErrorBoundary` renders it in-place when prod env catches an unhandled render error, passing the captured `Error` + `errorInfo.componentStack` + `handleReset` as `onRetry`; (2) the new `/error` lazy route in `client/src/router.tsx` mounts it standalone for QA. The DevPanel "Preview customer view" toggle in `DevErrorScreen` also routes to `ErrorPage` so devs can see exactly what users see. `ProdErrorScreen` and its prod-only strings + styles in `error-boundary/` are deleted; ErrorBoundary's `previewBack` banner-style still reused. Stack toggle defaults to hidden; expanding shows `${error.name}: ${error.message}\n\n${error.stack}\n\n${componentStack}`. The `<a href="/">` (rather than `<Link to="/">`) for "Back to library" is intentional — the outermost ErrorBoundary may catch above the Router.

## Notes

- **Design-lab route:** `/error` is wired in the design lab to allow QA to verify the error page visuals. In production, this route is not directly typed by users — it's reached via error boundary or explicit navigation with error details.
- **Error identity:** The red left border maintains visual consistency with the Xstream green theme by providing a clear "error" signal (red = stop/problem). Production may also consider a red avatar badge or top bar, depending on final UX review.
- **Retry semantics:** The mockup shows a "Retry" button, but the actual retry behaviour depends on what failed. In some cases, retrying means re-running a GraphQL query; in others, it means navigating back and letting the user try a different action. Define this clearly in the error context integration.
