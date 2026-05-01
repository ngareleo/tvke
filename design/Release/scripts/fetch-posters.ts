/**
 * Fetch real OMDb posters for the canonical lab films and save them under
 * design/Release/public/posters/<id>.jpg so the lab can run offline.
 *
 * Usage:
 *   OMDB_API_KEY=xxxx bun run design/Release/scripts/fetch-posters.ts
 *
 * The script is idempotent — re-running overwrites existing JPGs.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface FilmSeed {
  id: string;
  title: string;
  year: number;
}

const FILMS: FilmSeed[] = [
  { id: "oppenheimer", title: "Oppenheimer", year: 2023 },
  { id: "barbie", title: "Barbie", year: 2023 },
  { id: "nosferatu", title: "Nosferatu", year: 2024 },
  { id: "civilwar", title: "Civil War", year: 2024 },
];

interface OmdbResponse {
  Response: "True" | "False";
  Title?: string;
  Poster?: string;
  Error?: string;
}

const OMDB_BASE = "http://www.omdbapi.com/";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(SCRIPT_DIR, "..", "public", "posters");

async function fetchPoster(apiKey: string, film: FilmSeed): Promise<string> {
  const params = new URLSearchParams({
    t: film.title,
    y: String(film.year),
    apikey: apiKey,
    type: "movie",
  });
  const res = await fetch(`${OMDB_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`OMDb ${film.id}: HTTP ${res.status}`);
  const data = (await res.json()) as OmdbResponse;
  if (data.Response !== "True") {
    throw new Error(`OMDb ${film.id}: ${data.Error ?? "no match"}`);
  }
  if (!data.Poster || data.Poster === "N/A") {
    throw new Error(`OMDb ${film.id}: poster unavailable`);
  }
  return data.Poster;
}

async function downloadPoster(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function main(): Promise<void> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    process.stderr.write("OMDB_API_KEY is not set\n");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const film of FILMS) {
    const posterUrl = await fetchPoster(apiKey, film);
    const destPath = join(OUT_DIR, `${film.id}.jpg`);
    await downloadPoster(posterUrl, destPath);
    process.stdout.write(`saved ${film.id} -> ${destPath}\n`);
  }
}

await main();
