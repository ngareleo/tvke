import type { VideoMetadataRow } from "../../types.js";
import { getDb } from "../index.js";

export function upsertVideoMetadata(row: VideoMetadataRow): void {
  getDb()
    .prepare(
      `
      INSERT INTO video_metadata (video_id, imdb_id, title, year, genre, director, cast_list, rating, plot, poster_url, matched_at)
      VALUES ($video_id, $imdb_id, $title, $year, $genre, $director, $cast_list, $rating, $plot, $poster_url, $matched_at)
      ON CONFLICT(video_id) DO UPDATE SET
        imdb_id    = excluded.imdb_id,
        title      = excluded.title,
        year       = excluded.year,
        genre      = excluded.genre,
        director   = excluded.director,
        cast_list  = excluded.cast_list,
        rating     = excluded.rating,
        plot       = excluded.plot,
        poster_url = excluded.poster_url,
        matched_at = excluded.matched_at
    `
    )
    .run({
      $video_id: row.video_id,
      $imdb_id: row.imdb_id,
      $title: row.title,
      $year: row.year,
      $genre: row.genre,
      $director: row.director,
      $cast_list: row.cast_list,
      $rating: row.rating,
      $plot: row.plot,
      $poster_url: row.poster_url,
      $matched_at: row.matched_at,
    });
}

export function getMetadataByVideoId(videoId: string): VideoMetadataRow | null {
  return getDb()
    .prepare("SELECT * FROM video_metadata WHERE video_id = $video_id")
    .get({ $video_id: videoId }) as VideoMetadataRow | null;
}

/** Cheap existence check — avoids fetching the full metadata row. */
export function hasVideoMetadata(videoId: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM video_metadata WHERE video_id = $video_id LIMIT 1")
    .get({ $video_id: videoId }) as { 1: number } | null;
  return row !== null;
}

export function deleteVideoMetadata(videoId: string): void {
  getDb()
    .prepare("DELETE FROM video_metadata WHERE video_id = $video_id")
    .run({ $video_id: videoId });
}

export function getUnmatchedVideoIds(libraryId: string): string[] {
  const rows = getDb()
    .prepare(
      `
      SELECT v.id FROM videos v
      LEFT JOIN video_metadata m ON v.id = m.video_id
      WHERE v.library_id = $library_id AND m.video_id IS NULL
      `
    )
    .all({ $library_id: libraryId }) as { id: string }[];
  return rows.map((r) => r.id);
}

export function countMatchedByLibrary(libraryId: string): { matched: number; unmatched: number } {
  const row = getDb()
    .prepare(
      `
      SELECT
        COUNT(m.video_id) AS matched,
        COUNT(v.id) - COUNT(m.video_id) AS unmatched
      FROM videos v
      LEFT JOIN video_metadata m ON v.id = m.video_id
      WHERE v.library_id = $library_id
      `
    )
    .get({ $library_id: libraryId }) as { matched: number; unmatched: number };
  return row;
}
