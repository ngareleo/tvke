/**
 * OMDb service — fetches movie/TV metadata from the Open Movie Database.
 *
 * API key is read from process.env.OMDB_API_KEY. If missing, all lookups
 * return null gracefully so the scanner continues without metadata.
 *
 * Free tier: 1000 requests/day.
 */

import { getSetting } from "../db/queries/userSettings.js";

const OMDB_BASE = "http://www.omdbapi.com/";

export interface OmdbResult {
  imdbId: string;
  title: string;
  year: number | null;
  genre: string | null;
  director: string | null;
  actors: string[];
  plot: string | null;
  imdbRating: number | null;
  posterUrl: string | null;
}

interface OmdbApiResponse {
  Response: "True" | "False";
  imdbID?: string;
  Title?: string;
  Year?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Plot?: string;
  imdbRating?: string;
  Poster?: string;
  Error?: string;
}

function getApiKey(): string | null {
  // env var takes precedence; fall back to key saved via the Settings UI
  return process.env.OMDB_API_KEY ?? getSetting("omdbApiKey") ?? null;
}

function parseYear(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.slice(0, 4), 10);
  return Number.isFinite(n) ? n : null;
}

function parseRating(raw: string | undefined): number | null {
  if (!raw || raw === "N/A") return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function parsePoster(raw: string | undefined): string | null {
  if (!raw || raw === "N/A") return null;
  return raw;
}

function parseActors(raw: string | undefined): string[] {
  if (!raw || raw === "N/A") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapResponse(data: OmdbApiResponse): OmdbResult | null {
  if (data.Response !== "True" || !data.imdbID || !data.Title) return null;
  return {
    imdbId: data.imdbID,
    title: data.Title,
    year: parseYear(data.Year),
    genre: data.Genre === "N/A" ? null : (data.Genre ?? null),
    director: data.Director === "N/A" ? null : (data.Director ?? null),
    actors: parseActors(data.Actors),
    plot: data.Plot === "N/A" ? null : (data.Plot ?? null),
    imdbRating: parseRating(data.imdbRating),
    posterUrl: parsePoster(data.Poster),
  };
}

/**
 * Search OMDb for a title (and optional year). Returns the matched result or
 * null if no match, API key is missing, or the request fails.
 */
export async function searchOmdb(title: string, year?: number): Promise<OmdbResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({ t: title, apikey: apiKey, type: "movie" });
  if (year !== undefined) params.set("y", String(year));

  try {
    const res = await fetch(`${OMDB_BASE}?${params.toString()}`);
    if (!res.ok) return null;
    const data = (await res.json()) as OmdbApiResponse;
    return mapResponse(data);
  } catch {
    return null;
  }
}

/**
 * Fetch details by IMDb ID directly (used in the matchVideo mutation when the
 * user selects a specific result).
 */
export async function fetchOmdbById(imdbId: string): Promise<OmdbResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({ i: imdbId, apikey: apiKey });

  try {
    const res = await fetch(`${OMDB_BASE}?${params.toString()}`);
    if (!res.ok) return null;
    const data = (await res.json()) as OmdbApiResponse;
    return mapResponse(data);
  } catch {
    return null;
  }
}

/**
 * Search OMDb for a text query — used by the client's manual-link flow.
 * Uses the /s (search) endpoint which returns multiple results.
 */
export async function searchOmdbList(query: string, year?: number): Promise<OmdbResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const params = new URLSearchParams({ s: query, apikey: apiKey, type: "movie" });
  if (year !== undefined) params.set("y", String(year));

  try {
    const res = await fetch(`${OMDB_BASE}?${params.toString()}`);
    if (!res.ok) return [];

    const data = (await res.json()) as {
      Response: "True" | "False";
      Search?: Array<{ imdbID: string; Title: string; Year: string; Poster: string }>;
    };

    if (data.Response !== "True" || !data.Search) return [];

    return data.Search.map((item) => ({
      imdbId: item.imdbID,
      title: item.Title,
      year: parseYear(item.Year),
      genre: null,
      director: null,
      actors: [],
      plot: null,
      imdbRating: null,
      posterUrl: parsePoster(item.Poster),
    }));
  } catch {
    return [];
  }
}

export function isOmdbConfigured(): boolean {
  return Boolean(getApiKey());
}
