//! `Season` — a season of a TV-show `Video`, exposing its episode list.
//!
//! Resolved by `Video.seasons` (see `video.rs`); presenters do not run
//! against `Season` directly, so this is a `SimpleObject` whose fields
//! are populated by the parent resolver.

use async_graphql::SimpleObject;

use super::episode::Episode;

#[derive(SimpleObject, Clone)]
pub struct Season {
    pub season_number: i32,
    pub episodes: Vec<Episode>,
}
