#!/usr/bin/env bun
/**
 * setup-ffmpeg — install the ffmpeg binary pinned in scripts/ffmpeg-manifest.json.
 *
 * The manifest is the lockfile for native binaries: it names one exact asset
 * per platform, with the SHA256 the downloader must verify against. Any drift
 * from a pinned version is a code change, not a runtime decision.
 *
 * Per-platform install strategies:
 *   - linux-x64 / linux-arm64 → `deb-install`
 *       Downloads Jellyfin's .deb (which ships a bundled newer libva + iHD
 *       driver at /usr/lib/jellyfin-ffmpeg/) and installs it with `sudo dpkg
 *       -i`. This is the only way to get working VAAPI on distros whose own
 *       intel-media-driver predates the host GPU. Requires sudo once.
 *   - darwin-x64 / darwin-arm64 → `portable-tarball`
 *       Extracts the portable tar.xz into `vendor/ffmpeg/<platform>/`.
 *       VideoToolbox is an OS framework so no system deps needed.
 *   - win32-x64 → `portable-zip`
 *       Extracts the portable .zip into `vendor/ffmpeg/<platform>/`. D3D11VA
 *       / QSV / NVENC / AMF are provided by Windows + GPU drivers.
 *
 * Usage:
 *   bun run setup-ffmpeg          # idempotent; skips install if the pinned
 *                                 # version is already the active install
 *   bun run setup-ffmpeg --force  # re-download and re-install
 */

import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const MANIFEST_PATH = join(ROOT, "scripts", "ffmpeg-manifest.json");
const VENDOR_ROOT = join(ROOT, "vendor", "ffmpeg");
const DOWNLOAD_DIR = join(ROOT, "tmp");

const FORCE = process.argv.includes("--force");

interface PlatformEntry {
  asset: string;
  sha256: string;
  strategy: "deb-install" | "portable-tarball" | "portable-zip";
  installedPrefix?: string;
}

interface FfmpegManifest {
  ffmpeg: {
    distribution: string;
    version: string;
    versionString: string;
    releaseUrl: string;
    platforms: Record<string, PlatformEntry>;
  };
}

type Platform = "linux-x64" | "linux-arm64" | "darwin-x64" | "darwin-arm64" | "win32-x64";

function detectPlatform(): Platform {
  const key = `${process.platform}-${process.arch}`;
  switch (key) {
    case "linux-x64":
    case "linux-arm64":
    case "darwin-x64":
    case "darwin-arm64":
    case "win32-x64":
      return key;
    default:
      throw new Error(`Unsupported platform: ${key}. Supported: linux-x64, linux-arm64, darwin-x64, darwin-arm64, win32-x64.`);
  }
}

function loadManifest(): FfmpegManifest {
  const raw = readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw) as FfmpegManifest;
}

function binName(base: string): string {
  return process.platform === "win32" ? `${base}.exe` : base;
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolvePromise());
    stream.on("error", reject);
  });
  return hash.digest("hex");
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${url} failed: ${res.status} ${res.statusText}`);
  await mkdir(dirname(dest), { recursive: true });
  await Bun.write(dest, res);
}

function run(cmd: string, args: string[], opts: { input?: string } = {}): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(cmd, args, { encoding: "utf8", input: opts.input });
  return { status: result.status, stdout: result.stdout || "", stderr: result.stderr || "" };
}

/** Spawn with inherited stdio so the user sees sudo's password prompt. */
function runInteractive(cmd: string, args: string[]): Promise<number> {
  return new Promise((resolvePromise) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => resolvePromise(code ?? 1));
  });
}

// ── Version-check helpers ────────────────────────────────────────────────────

function getInstalledVersionString(binPath: string): string | null {
  if (!existsSync(binPath)) return null;
  const result = run(binPath, ["-version"]);
  if (result.status !== 0) return null;
  const firstLine = result.stdout.split("\n")[0];
  const match = firstLine.match(/ffmpeg version (\S+)/);
  return match ? match[1] : null;
}

// ── Strategy: deb-install ────────────────────────────────────────────────────

async function installDeb(entry: PlatformEntry, manifest: FfmpegManifest): Promise<void> {
  const prefix = entry.installedPrefix ?? "/usr/lib/jellyfin-ffmpeg";
  const installedBin = join(prefix, "ffmpeg");
  const installed = getInstalledVersionString(installedBin);

  if (!FORCE && installed === manifest.ffmpeg.versionString) {
    console.log(`✓ jellyfin-ffmpeg ${manifest.ffmpeg.versionString} already installed at ${prefix}`);
    return;
  }

  if (installed && !FORCE) {
    console.log(`  installed version ${installed} does not match pinned ${manifest.ffmpeg.versionString} — upgrading`);
  }

  const url = `${manifest.ffmpeg.releaseUrl}/${entry.asset}`;
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const debPath = join(DOWNLOAD_DIR, entry.asset);

  console.log(`\nDownloading ${url}`);
  await download(url, debPath);

  console.log("Verifying SHA256...");
  const actual = await sha256File(debPath);
  if (actual !== entry.sha256) {
    rmSync(debPath, { force: true });
    throw new Error(
      `SHA256 mismatch for ${entry.asset}:\n  expected: ${entry.sha256}\n  actual:   ${actual}\n\n` +
        `The file at ${url} has changed since the manifest was pinned. Investigate before trusting the download.`
    );
  }
  console.log(`  ✓ ${actual}`);

  console.log(`\nInstalling ${entry.asset} (requires sudo)`);
  const code = await runInteractive("sudo", ["dpkg", "-i", debPath]);
  if (code !== 0) {
    throw new Error(`sudo dpkg -i exited with code ${code}. See output above for diagnostics.`);
  }

  rmSync(debPath, { force: true });

  const afterInstall = getInstalledVersionString(installedBin);
  if (afterInstall !== manifest.ffmpeg.versionString) {
    throw new Error(
      `Post-install verification failed. Expected ${manifest.ffmpeg.versionString} at ${installedBin}, got '${afterInstall ?? "(not found)"}'.`
    );
  }
  console.log(`✓ ${installedBin} — ${afterInstall}`);
}

// ── Strategies: portable-tarball / portable-zip ──────────────────────────────

function extractArchive(archivePath: string, destDir: string): void {
  const isZip = archivePath.endsWith(".zip");
  const args = isZip ? ["-xf", archivePath, "-C", destDir] : ["-xJf", archivePath, "-C", destDir];
  const result = spawnSync("tar", args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`tar extraction failed (exit ${result.status}). Ensure 'tar' is on PATH.`);
  }
}

function relocateBinaries(searchDir: string, targetDir: string): void {
  const wanted = new Set([binName("ffmpeg"), binName("ffprobe")]);
  const found = new Map<string, string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (wanted.has(entry) && !found.has(entry)) found.set(entry, full);
    }
  };
  walk(searchDir);

  for (const name of wanted) {
    const src = found.get(name);
    if (!src) throw new Error(`Extracted archive did not contain '${name}'.`);
    renameSync(src, join(targetDir, name));
  }
}

async function installPortable(entry: PlatformEntry, manifest: FfmpegManifest, platform: Platform): Promise<void> {
  const vendorDir = join(VENDOR_ROOT, platform);
  const ffmpegPath = join(vendorDir, binName("ffmpeg"));
  const ffprobePath = join(vendorDir, binName("ffprobe"));

  const installed = getInstalledVersionString(ffmpegPath);
  if (!FORCE && installed === manifest.ffmpeg.versionString) {
    console.log(`✓ jellyfin-ffmpeg ${manifest.ffmpeg.versionString} already installed at ${vendorDir}`);
    return;
  }

  const url = `${manifest.ffmpeg.releaseUrl}/${entry.asset}`;
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const archivePath = join(DOWNLOAD_DIR, entry.asset);

  console.log(`\nDownloading ${url}`);
  await download(url, archivePath);

  console.log("Verifying SHA256...");
  const actual = await sha256File(archivePath);
  if (actual !== entry.sha256) {
    rmSync(archivePath, { force: true });
    throw new Error(
      `SHA256 mismatch for ${entry.asset}:\n  expected: ${entry.sha256}\n  actual:   ${actual}`
    );
  }
  console.log(`  ✓ ${actual}`);

  const scratch = join(DOWNLOAD_DIR, `ffmpeg-extract-${Date.now()}`);
  await mkdir(scratch, { recursive: true });
  console.log(`Extracting to ${scratch}`);
  extractArchive(archivePath, scratch);

  await mkdir(vendorDir, { recursive: true });
  console.log(`Relocating binaries to ${vendorDir}`);
  relocateBinaries(scratch, vendorDir);

  if (process.platform !== "win32") {
    spawnSync("chmod", ["+x", ffmpegPath, ffprobePath], { stdio: "inherit" });
  }

  rmSync(scratch, { recursive: true, force: true });
  rmSync(archivePath, { force: true });

  const afterInstall = getInstalledVersionString(ffmpegPath);
  if (afterInstall !== manifest.ffmpeg.versionString) {
    throw new Error(
      `Post-install verification failed. Expected ${manifest.ffmpeg.versionString} at ${ffmpegPath}, got '${afterInstall ?? "(not found)"}'.`
    );
  }
  console.log(`✓ ${ffmpegPath} — ${afterInstall}`);
  console.log(`✓ ${ffprobePath}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const manifest = loadManifest();
  const platform = detectPlatform();
  const entry = manifest.ffmpeg.platforms[platform];
  if (!entry) {
    throw new Error(`No manifest entry for platform ${platform}. Supported: ${Object.keys(manifest.ffmpeg.platforms).join(", ")}`);
  }

  console.log(`Platform:         ${platform}`);
  console.log(`Distribution:     ${manifest.ffmpeg.distribution}`);
  console.log(`Pinned version:   ${manifest.ffmpeg.version} (${manifest.ffmpeg.versionString})`);
  console.log(`Install strategy: ${entry.strategy}`);

  switch (entry.strategy) {
    case "deb-install":
      await installDeb(entry, manifest);
      break;
    case "portable-tarball":
    case "portable-zip":
      await installPortable(entry, manifest, platform);
      break;
    default:
      throw new Error(`Unknown install strategy '${(entry as { strategy: string }).strategy}'`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(`\nsetup-ffmpeg failed: ${err.message}`);
  process.exit(1);
});
