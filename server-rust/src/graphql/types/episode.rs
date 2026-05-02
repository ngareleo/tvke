//! `Episode` — one episode of a TV show, optionally backed by a real
//! file's `Video` row. Built by `Video.seasons` resolver in `video.rs`
//! from `(EpisodeRow, Option<&VideoRow>)`. The `videoId` is the global
//! Relay ID the Player URL `/player/:videoId` resolves to when on-disk.

use async_graphql::{SimpleObject, ID};

use crate::db::{EpisodeRow, VideoRow};
use crate::graphql::scalars::Resolution;
use crate::relay::to_global_id;

#[derive(SimpleObject, Clone)]
pub struct Episode {
    pub episode_number: i32,
    pub season_number: i32,
    pub title: Option<String>,
    pub duration_seconds: Option<f64>,
    pub on_disk: bool,
    pub native_resolution: Option<Resolution>,
    pub video_id: Option<ID>,
}

impl Episode {
    pub fn from_row(row: &EpisodeRow, video_row: Option<&VideoRow>) -> Self {
        let on_disk = video_row.is_some();
        let native_resolution = video_row
            .and_then(|v| v.native_resolution.as_deref())
            .and_then(|raw| {
                Resolution::from_internal(raw).or_else(|| {
                    tracing::warn!(
                        episode_video_id = ?row.episode_video_id,
                        raw = %raw,
                        "episode video native_resolution held an unknown value — returning None"
                    );
                    None
                })
            });
        Self {
            episode_number: row.episode_number as i32,
            season_number: row.season_number as i32,
            title: row.title.clone(),
            duration_seconds: video_row.map(|v| v.duration_seconds),
            on_disk,
            native_resolution,
            video_id: video_row.map(|v| ID(to_global_id("Video", &v.id))),
        }
    }
}
