//! `GET /settings?keys=k1,k2,...` — boot-time settings read for the client.

use axum::{
    extract::Query,
    response::{IntoResponse, Json, Response},
    Extension,
};
use http::StatusCode;
use serde::{Deserialize, Serialize};

use crate::config::AppContext;
use crate::db;

#[derive(Deserialize)]
pub struct SettingsQuery {
    keys: String,
}

#[derive(Serialize, Debug, PartialEq)]
pub struct SettingEntry {
    key: String,
    value: Option<String>,
}

pub async fn get_settings(
    Query(params): Query<SettingsQuery>,
    Extension(ctx): Extension<AppContext>,
) -> Response {
    let keys: Vec<&str> = params
        .keys
        .split(',')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .collect();

    if keys.is_empty() {
        return (StatusCode::BAD_REQUEST, "keys query parameter is required").into_response();
    }

    let out: Vec<SettingEntry> = keys
        .into_iter()
        .map(|key| SettingEntry {
            key: key.to_string(),
            value: db::get_setting(&ctx.db, key).ok().flatten(),
        })
        .collect();
    Json(out).into_response()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::queries::user_settings::set_setting;
    use crate::db::Db;
    use std::path::Path;

    fn fresh_db() -> Db {
        Db::open(Path::new(":memory:")).expect("open in-memory db")
    }

    #[test]
    fn parses_csv_keys_and_drops_empties() {
        let parsed: Vec<&str> = "a,b, ,c"
            .split(',')
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .collect();
        assert_eq!(parsed, vec!["a", "b", "c"]);
    }

    #[test]
    fn missing_key_returns_null_value() {
        let db = fresh_db();
        let entry = SettingEntry {
            key: "no.such.key".into(),
            value: db::get_setting(&db, "no.such.key").ok().flatten(),
        };
        assert_eq!(entry.value, None);
    }

    #[test]
    fn present_key_returns_stored_value() {
        let db = fresh_db();
        set_setting(&db, "flag.useAxiomExporter", "1").expect("set");
        let entry = SettingEntry {
            key: "flag.useAxiomExporter".into(),
            value: db::get_setting(&db, "flag.useAxiomExporter").ok().flatten(),
        };
        assert_eq!(entry.value, Some("1".into()));
    }
}
