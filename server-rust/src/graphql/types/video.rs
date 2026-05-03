//! `Video` + nested types: `VideoMetadata`, `VideoStreamInfo`,
//! `AudioStreamInfo`, plus the connection wrappers for paginated queries.

use async_graphql::{Context, Object, SimpleObject, ID};

use super::library::Library;
use super::node::PageInfo;
use super::season::Season;
use crate::db::{
    self, get_episodes_by_show, get_library_by_id, get_metadata_by_video_id, get_seasons_by_show,
    get_streams_by_video_id, get_video_by_id, Db, EpisodeRow, VideoRow,
};
use crate::graphql::scalars::{MediaType, Resolution};
use crate::graphql::types::episode::Episode;
use crate::relay::to_global_id;

#[derive(Clone)]
pub struct Video {
    pub id: ID,
    pub title: String,
    pub filename: String,
    pub duration_seconds: f64,
    pub file_size_bytes: f64,
    pub bitrate: i32,
    pub raw: VideoRow,
}

impl Video {
    pub fn from_row(row: &VideoRow) -> Self {
        Self {
            id: ID(to_global_id("Video", &row.id)),
            title: row.title.clone().unwrap_or_else(|| row.filename.clone()),
            filename: row.filename.clone(),
            duration_seconds: row.duration_seconds,
            file_size_bytes: row.file_size_bytes as f64,
            bitrate: row.bitrate as i32,
            raw: row.clone(),
        }
    }
}

#[Object]
impl Video {
    pub async fn id(&self) -> &ID {
        &self.id
    }
    async fn title(&self) -> &str {
        &self.title
    }
    async fn filename(&self) -> &str {
        &self.filename
    }
    async fn duration_seconds(&self) -> f64 {
        self.duration_seconds
    }
    async fn file_size_bytes(&self) -> f64 {
        self.file_size_bytes
    }
    async fn bitrate(&self) -> i32 {
        self.bitrate
    }

    async fn matched(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let db = ctx.data_unchecked::<Db>();
        Ok(db::has_video_metadata(db, &self.raw.id)?)
    }

    async fn media_type(&self, ctx: &Context<'_>) -> async_graphql::Result<MediaType> {
        let db = ctx.data_unchecked::<Db>();
        let lib = get_library_by_id(db, &self.raw.library_id)?;
        Ok(lib
            .and_then(|l| {
                let raw = l.media_type;
                MediaType::from_internal(&raw).or_else(|| {
                    tracing::warn!(
                        video_id = %self.raw.id,
                        library_id = %self.raw.library_id,
                        raw = %raw,
                        "libraries.media_type held an unknown value (via Video.media_type) — defaulting to MOVIES"
                    );
                    Some(MediaType::Movies)
                })
            })
            .unwrap_or(MediaType::Movies))
    }

    async fn library(&self, ctx: &Context<'_>) -> async_graphql::Result<Library> {
        let db = ctx.data_unchecked::<Db>();
        let row = get_library_by_id(db, &self.raw.library_id)?.ok_or_else(|| {
            async_graphql::Error::new(format!(
                "Video {:?} references missing library {}",
                self.id, self.raw.library_id
            ))
        })?;
        Ok(Library::from_row(&row))
    }

    async fn metadata(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<VideoMetadata>> {
        let db = ctx.data_unchecked::<Db>();
        Ok(get_metadata_by_video_id(db, &self.raw.id)?.map(VideoMetadata::from_row))
    }

    async fn video_stream(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<VideoStreamInfo>> {
        let db = ctx.data_unchecked::<Db>();
        let streams = get_streams_by_video_id(db, &self.raw.id)?;
        let vs = streams.into_iter().find(|s| s.stream_type == "video");
        let vs = match vs {
            Some(v) => v,
            None => return Ok(None),
        };
        match (vs.width, vs.height, vs.fps) {
            (Some(w), Some(h), Some(fps)) => Ok(Some(VideoStreamInfo {
                codec: vs.codec,
                width: w as i32,
                height: h as i32,
                fps,
            })),
            _ => Ok(None),
        }
    }

    async fn audio_stream(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<AudioStreamInfo>> {
        let db = ctx.data_unchecked::<Db>();
        let streams = get_streams_by_video_id(db, &self.raw.id)?;
        let a = streams.into_iter().find(|s| s.stream_type == "audio");
        let a = match a {
            Some(v) => v,
            None => return Ok(None),
        };
        match (a.channels, a.sample_rate) {
            (Some(ch), Some(sr)) => Ok(Some(AudioStreamInfo {
                codec: a.codec,
                channels: ch as i32,
                sample_rate: sr as i32,
            })),
            _ => Ok(None),
        }
    }

    /// Native resolution rung determined at scan time. Null for rows scanned
    /// before the column was added (or for synthetic show rows that carry no
    /// playable file). An unknown value in the DB column is logged + degraded
    /// to None — the warn-then-degrade contract for enum mappers (§14).
    async fn native_resolution(&self) -> Option<Resolution> {
        let raw = self.raw.native_resolution.as_deref()?;
        Resolution::from_internal(raw).or_else(|| {
            tracing::warn!(
                video_id = %self.raw.id,
                raw = %raw,
                "videos.native_resolution held an unknown value — returning None"
            );
            None
        })
    }

    /// For TV-show videos, the full season tree resolved from the seasons +
    /// episodes tables joined back to each episode's `Video` row. Movies
    /// return an empty list. Episode `Video` rows are batch-fetched once
    /// per query so the resolver is N+1-free.
    async fn seasons(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Season>> {
        let db = ctx.data_unchecked::<Db>();

        // Movies: short-circuit. The seasons/episodes tables stay empty for
        // movie-typed libraries, but skipping the lookup avoids two
        // round-trips for the common case.
        let lib = match get_library_by_id(db, &self.raw.library_id)? {
            Some(l) => l,
            None => return Ok(Vec::new()),
        };
        if lib.media_type != "tvShows" {
            return Ok(Vec::new());
        }

        let seasons = get_seasons_by_show(db, &self.raw.id)?;
        let episodes = get_episodes_by_show(db, &self.raw.id)?;

        // Resolve every linked episode video row in a single pass before
        // grouping, so each episode can carry its onDisk + duration +
        // nativeResolution from the corresponding `Video` row.
        let mut episode_videos: std::collections::HashMap<String, VideoRow> =
            std::collections::HashMap::new();
        for ep in &episodes {
            if let Some(vid) = &ep.episode_video_id {
                if !episode_videos.contains_key(vid) {
                    if let Some(row) = get_video_by_id(db, vid)? {
                        episode_videos.insert(vid.clone(), row);
                    }
                }
            }
        }

        let mut tree: Vec<Season> = Vec::with_capacity(seasons.len());
        for season in seasons {
            let eps: Vec<Episode> = episodes
                .iter()
                .filter(|e| e.season_number == season.season_number)
                .map(|e| Episode::from_row(e, episode_video_for(e, &episode_videos)))
                .collect();
            tree.push(Season {
                season_number: season.season_number as i32,
                episodes: eps,
            });
        }
        Ok(tree)
    }
}

fn episode_video_for<'a>(
    ep: &EpisodeRow,
    map: &'a std::collections::HashMap<String, VideoRow>,
) -> Option<&'a VideoRow> {
    ep.episode_video_id.as_deref().and_then(|id| map.get(id))
}

#[derive(SimpleObject, Clone)]
pub struct VideoMetadata {
    pub imdb_id: String,
    pub title: String,
    pub year: Option<i32>,
    pub genre: Option<String>,
    pub director: Option<String>,
    pub cast: Vec<String>,
    pub rating: Option<f64>,
    pub plot: Option<String>,
    pub poster_url: Option<String>,
}

impl VideoMetadata {
    pub fn from_row(row: crate::db::VideoMetadataRow) -> Self {
        let cast: Vec<String> = match row.cast_list.as_deref() {
            None => Vec::new(),
            Some(raw) => match serde_json::from_str(raw) {
                Ok(v) => v,
                Err(err) => {
                    tracing::warn!(
                        video_id = %row.video_id,
                        raw = %raw,
                        error = %err,
                        "video_metadata.cast_list held malformed JSON — rendering empty cast"
                    );
                    Vec::new()
                }
            },
        };
        Self {
            imdb_id: row.imdb_id,
            title: row.title,
            year: row.year.map(|y| y as i32),
            genre: row.genre,
            director: row.director,
            cast,
            rating: row.rating,
            plot: row.plot,
            poster_url: row.poster_url,
        }
    }
}

#[derive(SimpleObject, Clone)]
pub struct VideoStreamInfo {
    pub codec: String,
    pub width: i32,
    pub height: i32,
    pub fps: f64,
}

#[derive(SimpleObject, Clone)]
pub struct AudioStreamInfo {
    pub codec: String,
    pub channels: i32,
    pub sample_rate: i32,
}

#[derive(SimpleObject, Clone)]
pub struct VideoConnection {
    pub edges: Vec<VideoEdge>,
    pub page_info: PageInfo,
    pub total_count: i32,
}

#[derive(SimpleObject, Clone)]
pub struct VideoEdge {
    pub node: Video,
    pub cursor: String,
}
