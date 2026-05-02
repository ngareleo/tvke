/**
 * Maps the GraphQL `Resolution` enum to the chip label rendered in the
 * tile subtitle. Mirrors the table in `FilmDetailsOverlay.tsx`; lift to
 * `~/utils/formatters.ts` once a third consumer needs it.
 */
const RESOLUTION_LABEL: Record<string, string> = {
  RESOLUTION_4K: "4K",
  RESOLUTION_1080P: "1080p",
  RESOLUTION_720P: "720p",
  RESOLUTION_480P: "480p",
  RESOLUTION_360P: "360p",
  RESOLUTION_240P: "240p",
};

export function resolutionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return RESOLUTION_LABEL[value] ?? null;
}

/**
 * `WatchlistItem.addedAt` ships from the server as a permissive ISO-ish
 * string (`server-rust` writes RFC 3339; older rows may be a date-only
 * fragment). We render either a "X days ago" relative string for the
 * last week, or a short date otherwise. Falls back to the raw string if
 * parsing fails so we never render `Invalid Date`.
 */
export function formatAddedAt(value: string, now: Date = new Date()): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Clamp a 0–100 progress percentage derived from `progressSeconds /
 * durationSeconds`. Returns `null` when there is no playable progress
 * (zero progress, zero duration, or negative). The tile only renders
 * the progress bar when this returns a finite percentage.
 */
export function progressPercent(progressSeconds: number, durationSeconds: number): number | null {
  if (progressSeconds <= 0 || durationSeconds <= 0) return null;
  const pct = (progressSeconds / durationSeconds) * 100;
  if (!Number.isFinite(pct)) return null;
  return Math.max(0, Math.min(100, pct));
}
