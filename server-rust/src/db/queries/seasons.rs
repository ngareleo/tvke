//! Seasons + episodes queries for the TV-show hierarchy added in M2 of the
//! release-design migration. The "show" itself is a `Video` row with
//! `media_type = TV_SHOWS` (no playable file). Episodes are first-class
//! `Video` rows; the join here records (show, season, episode) → episode's
//! `Video.id`.
//!
//! See `docs/migrations/release-design/Schema-Changes.md` for the SDL +
//! SQL spec.

use rusqlite::{params, Row};

use crate::db::Db;
use crate::error::DbResult;

#[derive(Clone, Debug)]
pub struct SeasonRow {
    pub show_video_id: String,
    pub season_number: i64,
}

impl SeasonRow {
    fn from_row(r: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            show_video_id: r.get("show_video_id")?,
            season_number: r.get("season_number")?,
        })
    }
}

#[derive(Clone, Debug)]
pub struct EpisodeRow {
    pub show_video_id: String,
    pub season_number: i64,
    pub episode_number: i64,
    pub title: Option<String>,
    pub episode_video_id: Option<String>,
}

impl EpisodeRow {
    fn from_row(r: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            show_video_id: r.get("show_video_id")?,
            season_number: r.get("season_number")?,
            episode_number: r.get("episode_number")?,
            title: r.get("title")?,
            episode_video_id: r.get("episode_video_id")?,
        })
    }
}

pub fn get_seasons_by_show(db: &Db, show_video_id: &str) -> DbResult<Vec<SeasonRow>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT show_video_id, season_number
             FROM seasons
             WHERE show_video_id = ?1
             ORDER BY season_number ASC",
        )?;
        let rows = stmt.query_map(params![show_video_id], SeasonRow::from_row)?;
        let collected: rusqlite::Result<Vec<_>> = rows.collect();
        Ok(collected?)
    })
}

pub fn get_episodes_by_show(db: &Db, show_video_id: &str) -> DbResult<Vec<EpisodeRow>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT show_video_id, season_number, episode_number, title, episode_video_id
             FROM episodes
             WHERE show_video_id = ?1
             ORDER BY season_number ASC, episode_number ASC",
        )?;
        let rows = stmt.query_map(params![show_video_id], EpisodeRow::from_row)?;
        let collected: rusqlite::Result<Vec<_>> = rows.collect();
        Ok(collected?)
    })
}

pub fn upsert_season(db: &Db, show_video_id: &str, season_number: i64) -> DbResult<()> {
    db.with(|c| {
        c.execute(
            "INSERT INTO seasons (show_video_id, season_number)
             VALUES (?1, ?2)
             ON CONFLICT(show_video_id, season_number) DO NOTHING",
            params![show_video_id, season_number],
        )?;
        Ok(())
    })
}

pub fn upsert_episode(db: &Db, row: &EpisodeRow) -> DbResult<()> {
    db.with(|c| {
        c.execute(
            r#"INSERT INTO episodes
                 (show_video_id, season_number, episode_number, title, episode_video_id)
               VALUES (?1, ?2, ?3, ?4, ?5)
               ON CONFLICT(show_video_id, season_number, episode_number) DO UPDATE SET
                 title            = excluded.title,
                 episode_video_id = excluded.episode_video_id"#,
            params![
                row.show_video_id,
                row.season_number,
                row.episode_number,
                row.title,
                row.episode_video_id,
            ],
        )?;
        Ok(())
    })
}

// ── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    fn fresh_db() -> Db {
        Db::open(Path::new(":memory:")).expect("open in-memory db")
    }

    fn seed_show_and_episodes(db: &Db) {
        db.with(|c| {
            c.execute(
                "INSERT INTO libraries (id, name, path, media_type, env, video_extensions)
                 VALUES ('lib-tv', 'TV Lib', '/tv', 'tvShows', 'dev', '[]')",
                [],
            )?;
            for (vid, p, fname, title) in [
                ("show-aaa", "/tv/show", "show", "Show"),
                ("ep-s01e01", "/tv/show/s01e01.mkv", "s01e01.mkv", "Pilot"),
                ("ep-s01e02", "/tv/show/s01e02.mkv", "s01e02.mkv", ""),
                ("ep-s02e01", "/tv/show/s02e01.mkv", "s02e01.mkv", ""),
            ] {
                c.execute(
                    "INSERT INTO videos
                       (id, library_id, path, filename, title, duration_seconds,
                        file_size_bytes, bitrate, scanned_at, content_fingerprint)
                     VALUES (?1, 'lib-tv', ?2, ?3, ?4, 3600, 1000, 5000,
                             '2026-01-01T00:00:00.000Z', ?5)",
                    params![vid, p, fname, title, format!("1000:{vid}")],
                )?;
            }
            Ok(())
        })
        .expect("seed");
    }

    #[test]
    fn upsert_season_is_idempotent() {
        let db = fresh_db();
        seed_show_and_episodes(&db);
        upsert_season(&db, "show-aaa", 1).expect("first upsert");
        upsert_season(&db, "show-aaa", 1).expect("second upsert");
        let seasons = get_seasons_by_show(&db, "show-aaa").expect("list seasons");
        assert_eq!(seasons.len(), 1);
        assert_eq!(seasons[0].season_number, 1);
    }

    #[test]
    fn upsert_episode_updates_title_and_video_link_in_place() {
        let db = fresh_db();
        seed_show_and_episodes(&db);
        upsert_season(&db, "show-aaa", 1).expect("upsert season");
        upsert_episode(
            &db,
            &EpisodeRow {
                show_video_id: "show-aaa".to_string(),
                season_number: 1,
                episode_number: 1,
                title: Some("Pilot".to_string()),
                episode_video_id: Some("ep-s01e01".to_string()),
            },
        )
        .expect("first upsert");
        upsert_episode(
            &db,
            &EpisodeRow {
                show_video_id: "show-aaa".to_string(),
                season_number: 1,
                episode_number: 1,
                title: Some("Pilot (Director's Cut)".to_string()),
                episode_video_id: Some("ep-s01e01".to_string()),
            },
        )
        .expect("second upsert");
        let eps = get_episodes_by_show(&db, "show-aaa").expect("list episodes");
        let s1e1: Vec<_> = eps
            .iter()
            .filter(|e| e.season_number == 1 && e.episode_number == 1)
            .collect();
        assert_eq!(s1e1.len(), 1);
        assert_eq!(s1e1[0].title.as_deref(), Some("Pilot (Director's Cut)"));
    }

    #[test]
    fn get_episodes_by_show_returns_them_grouped_in_ascending_order() {
        let db = fresh_db();
        seed_show_and_episodes(&db);
        upsert_season(&db, "show-aaa", 1).expect("season 1");
        upsert_season(&db, "show-aaa", 2).expect("season 2");
        for (sn, en, vid) in [
            (2, 1, "ep-s02e01"),
            (1, 2, "ep-s01e02"),
            (1, 1, "ep-s01e01"),
        ] {
            upsert_episode(
                &db,
                &EpisodeRow {
                    show_video_id: "show-aaa".to_string(),
                    season_number: sn,
                    episode_number: en,
                    title: None,
                    episode_video_id: Some(vid.to_string()),
                },
            )
            .expect("upsert episode");
        }
        let eps = get_episodes_by_show(&db, "show-aaa").expect("list");
        let keys: Vec<String> = eps
            .iter()
            .map(|e| format!("S{}E{}", e.season_number, e.episode_number))
            .collect();
        assert_eq!(keys, vec!["S1E1", "S1E2", "S2E1"]);
    }

    #[test]
    fn get_seasons_by_show_returns_seasons_in_ascending_order() {
        let db = fresh_db();
        seed_show_and_episodes(&db);
        upsert_season(&db, "show-aaa", 2).expect("season 2");
        upsert_season(&db, "show-aaa", 1).expect("season 1");
        let seasons = get_seasons_by_show(&db, "show-aaa").expect("list");
        let nums: Vec<i64> = seasons.iter().map(|s| s.season_number).collect();
        assert_eq!(nums, vec![1, 2]);
    }

    #[test]
    fn queries_scoped_by_show_id_return_empty_for_unknown_show() {
        let db = fresh_db();
        seed_show_and_episodes(&db);
        assert!(get_seasons_by_show(&db, "nonexistent")
            .expect("empty seasons")
            .is_empty());
        assert!(get_episodes_by_show(&db, "nonexistent")
            .expect("empty episodes")
            .is_empty());
    }
}
