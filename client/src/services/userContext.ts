/** Module-scoped `user.id` read by telemetry exporters at emit time. See `docs/architecture/Identity/03-Telemetry-Correlation.md`. */

let currentUserId: string | null = null;

export function setUserContext(userId: string): void {
  currentUserId = userId;
}

export function getUserContext(): string | null {
  return currentUserId;
}

export function clearUserContext(): void {
  currentUserId = null;
}

/**
 * Sync check used by router loaders. The user id is populated by
 * `restoreSession()` before React mounts (see main.tsx) and kept in
 * lockstep via `subscribeToAuthChanges`, so this is the canonical
 * client-side answer to "is a session present?" without paying for a
 * Web Lock + microtask hop per navigation.
 */
export function hasActiveSession(): boolean {
  return currentUserId !== null;
}
