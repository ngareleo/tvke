/**
 * View Transitions API helper. Wraps a DOM-mutation callback in
 * `document.startViewTransition` when supported (Chrome 111+, Edge 111+),
 * falling back to a direct call elsewhere. Use for navigation/page swaps
 * that should crossfade rather than cut.
 */
export function withViewTransition(fn: () => void): void {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (
      document as Document & { startViewTransition: (cb: () => void) => unknown }
    ).startViewTransition(fn);
    return;
  }
  fn();
}
