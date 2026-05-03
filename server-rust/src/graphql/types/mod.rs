//! GraphQL object types.
//!
//! Field nullability, arg defaults, and enum-variant names are part of the
//! published wire contract — the SDL-parity check fails on any drift and
//! the Relay client's generated artifacts won't deserialise.
//!
//! One file per domain to keep individual files small and the SDL-parity
//! diff easy to read when something drifts.

pub mod episode;
mod film;
mod library;
mod misc;
mod node;
mod omdb;
mod playback_session;
pub mod season;
mod show;
mod transcode_job;
mod video;
mod watchlist;

pub use episode::Episode;
pub use film::{Film, FilmConnection, FilmEdge};
pub use library::{Library, LibraryStats};
pub use misc::{DirEntry, LibraryScanProgress, LibraryScanUpdate, SettingEntry};
pub use node::{Node, PageInfo};
pub use omdb::OmdbSearchResult;
pub use playback_session::PlaybackSession;
pub use season::Season;
pub use show::{Show, ShowConnection, ShowEdge, ShowMetadata};
pub use transcode_job::{PlaybackError, StartTranscodeResult, TranscodeJob};
pub use video::{
    AudioStreamInfo, Video, VideoConnection, VideoEdge, VideoMetadata, VideoStreamInfo,
};
pub use watchlist::WatchlistItem;

/// Pick the URL the client should fetch for a poster. When the local
/// cache has the file, return the same-origin `/poster/<basename>`
/// route — the image is served from the user's disk and works offline.
/// Otherwise fall back to the OMDb canonical URL so freshly-matched
/// rows still render before the worker has caught up.
pub fn poster_url_for_metadata(
    poster_local_path: Option<&str>,
    poster_url: Option<&str>,
) -> Option<String> {
    if let Some(basename) = poster_local_path {
        if !basename.is_empty() {
            return Some(format!("/poster/{basename}"));
        }
    }
    poster_url.map(|s| s.to_string())
}
