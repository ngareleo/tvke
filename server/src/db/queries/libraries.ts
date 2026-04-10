import { getDb } from "../index.js";
import type { LibraryRow } from "../../types.js";

export function upsertLibrary(row: LibraryRow): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO libraries (id, name, path, media_type, env)
    VALUES ($id, $name, $path, $media_type, $env)
    ON CONFLICT(path) DO UPDATE SET
      name       = excluded.name,
      media_type = excluded.media_type,
      env        = excluded.env
  `).run({
    $id: row.id,
    $name: row.name,
    $path: row.path,
    $media_type: row.media_type,
    $env: row.env,
  });
}

export function getAllLibraries(): LibraryRow[] {
  return getDb().prepare("SELECT * FROM libraries").all() as LibraryRow[];
}

export function getLibraryById(id: string): LibraryRow | null {
  return (getDb()
    .prepare("SELECT * FROM libraries WHERE id = $id")
    .get({ $id: id }) as LibraryRow | null);
}
