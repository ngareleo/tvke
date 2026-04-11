import { createHash } from "crypto";

import type { WatchlistItemRow } from "../../types.js";
import { getDb } from "../index.js";

function generateId(videoId: string): string {
  return createHash("sha1").update(`watchlist:${videoId}`).digest("hex");
}

export function addWatchlistItem(videoId: string): WatchlistItemRow {
  const id = generateId(videoId);
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `
      INSERT INTO watchlist_items (id, video_id, added_at, progress_seconds)
      VALUES ($id, $video_id, $added_at, 0)
      ON CONFLICT(video_id) DO NOTHING
      `
    )
    .run({ $id: id, $video_id: videoId, $added_at: now });
  return getWatchlistItemByVideoId(videoId) as WatchlistItemRow;
}

export function removeWatchlistItem(id: string): boolean {
  const result = getDb().prepare("DELETE FROM watchlist_items WHERE id = $id").run({ $id: id });
  return result.changes > 0;
}

export function updateWatchlistProgress(
  videoId: string,
  progressSeconds: number
): WatchlistItemRow | null {
  getDb()
    .prepare("UPDATE watchlist_items SET progress_seconds = $progress WHERE video_id = $video_id")
    .run({ $progress: progressSeconds, $video_id: videoId });
  return getWatchlistItemByVideoId(videoId);
}

export function getWatchlist(): WatchlistItemRow[] {
  return getDb()
    .prepare("SELECT * FROM watchlist_items ORDER BY added_at DESC")
    .all() as WatchlistItemRow[];
}

export function getWatchlistItemByVideoId(videoId: string): WatchlistItemRow | null {
  return getDb()
    .prepare("SELECT * FROM watchlist_items WHERE video_id = $video_id")
    .get({ $video_id: videoId }) as WatchlistItemRow | null;
}

export function getWatchlistItemById(id: string): WatchlistItemRow | null {
  return getDb()
    .prepare("SELECT * FROM watchlist_items WHERE id = $id")
    .get({ $id: id }) as WatchlistItemRow | null;
}
