/**
 * ffmpegPath — resolves the on-disk paths for the ffmpeg and ffprobe binaries.
 *
 * Priority:
 *   1. FFMPEG_PATH / FFPROBE_PATH env vars (explicit override)
 *   2. /usr/lib/jellyfin-ffmpeg/ffmpeg (Linux only, if present) — the Jellyfin
 *      .deb installs here and ships a bundled newer libva + iHD driver via
 *      compiled-in RUNPATH, which is the only way to get working VAAPI on
 *      Linux distros whose system intel-media-driver predates a recent GPU
 *      (e.g. Ubuntu noble's 24.1.0 vs Lunar Lake needing 24.2.0+). Preferred
 *      over the portable vendor binary because the vendor one loads the
 *      system driver and fails on exactly those configurations.
 *   3. vendor/ffmpeg/<platform>/ffmpeg[.exe] — the portable jellyfin-ffmpeg
 *      populated by `bun run setup-ffmpeg`. Works on macOS/Windows out of the
 *      box; on Linux it works when the system VAAPI stack is new enough.
 *   4. System $PATH (dev fallback via `which ffmpeg`)
 *   5. Error — refuses to start; caller must surface the message
 *
 * Designed to match the Rust/Tauri rewrite's eventual bundling model: a
 * per-platform `vendor/ffmpeg/<platform>/` directory is included in the app
 * resources, and the same resolver logic finds it in production. For Linux,
 * the Tauri bundle will ship the full Jellyfin stack (libva + iHD driver +
 * libigdgmm) under its own prefix so this two-step fallback isn't needed at
 * runtime.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../..");
const VENDOR_ROOT = join(ROOT, "vendor", "ffmpeg");
const JELLYFIN_LINUX_PREFIX = "/usr/lib/jellyfin-ffmpeg";

export interface FfmpegPaths {
  ffmpeg: string;
  ffprobe: string;
}

function platformKey(): string {
  return `${process.platform}-${process.arch}`;
}

function binName(base: string): string {
  return process.platform === "win32" ? `${base}.exe` : base;
}

function findOnPath(name: string): string | null {
  const which = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(which, [name], { encoding: "utf8" });
  if (result.status !== 0) return null;
  const first = result.stdout.split(/\r?\n/).find((l) => l.trim().length > 0);
  return first ? first.trim() : null;
}

function resolveOne(envVar: string, base: "ffmpeg" | "ffprobe"): string {
  const override = process.env[envVar];
  if (override && existsSync(override)) return override;

  if (process.platform === "linux") {
    const jellyfinPath = join(JELLYFIN_LINUX_PREFIX, base);
    if (existsSync(jellyfinPath)) return jellyfinPath;
  }

  const vendored = join(VENDOR_ROOT, platformKey(), binName(base));
  if (existsSync(vendored)) return vendored;

  const onPath = findOnPath(base);
  if (onPath) return onPath;

  const triedJellyfin =
    process.platform === "linux" ? `\n  2. ${JELLYFIN_LINUX_PREFIX}/${base}` : "";
  throw new Error(
    `Could not locate '${base}' binary. Tried:\n` +
      `  1. ${envVar} env var (unset or file missing)${triedJellyfin}\n` +
      `  ${process.platform === "linux" ? "3" : "2"}. ${vendored}\n` +
      `  ${process.platform === "linux" ? "4" : "3"}. system PATH\n\n` +
      `Run 'bun run setup-ffmpeg' from the project root to download a working binary, ` +
      `or set ${envVar} to point at an existing ffmpeg/ffprobe.`
  );
}

let cached: FfmpegPaths | null = null;

export function resolveFfmpegPaths(): FfmpegPaths {
  if (cached) return cached;
  cached = {
    ffmpeg: resolveOne("FFMPEG_PATH", "ffmpeg"),
    ffprobe: resolveOne("FFPROBE_PATH", "ffprobe"),
  };
  return cached;
}
