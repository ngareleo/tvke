import { getDb } from "../index.js";

export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare("SELECT value FROM user_settings WHERE key = $key")
    .get({ $key: key }) as { value: string } | null;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      `
      INSERT INTO user_settings (key, value) VALUES ($key, $value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `
    )
    .run({ $key: key, $value: value });
}

export function deleteSetting(key: string): void {
  getDb().prepare("DELETE FROM user_settings WHERE key = $key").run({ $key: key });
}
