# Interim Desktop Shell

> **Status:** stop-gap analysis. The northstar is the Rust + Tauri rewrite (`docs/migrations/rust-rewrite/`). This doc evaluates how to ship the **current Bun-server + React-client architecture** as a desktop app *before* the Rust port lands, so the product can be released and iterated on without rushing the rewrite.

The migration spec at [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) explicitly assumes the Rust port has landed; it is phase F of the migration. Nothing in `docs/` today addresses interim packaging of the Bun prototype. This doc fills that gap.

The framing question: *which interim shell is right, given that we will throw it away when the Rust + Tauri port lands?* Three serious shell candidates are evaluated — Electron, Tauri-with-Bun-sidecar, Electrobun — alongside two also-rans.

## 1. The architectural surface a shell must accept

Every load-bearing runtime concern, with a code pointer. A shell wrapper either accommodates each of these or breaks something.

- **Bun runtime + `bun:sqlite`.** Server entry at `server/src/index.ts`; DB initialisation at `server/src/db/index.ts` (WAL + foreign keys, auto-migrate on first `getDb()` call). The Bun runtime is *not* statically linked, so any shell ships either the Bun binary alongside or a `bun build --compile` standalone.
- **`Bun.serve()` listening on `config.port` with `idleTimeout: 0`** (`server/src/index.ts`, lines 77–113). Two endpoints share the path: `/graphql` (HTTP GET/POST + WS upgrade for `graphql-ws`) and `/stream/:jobId` (binary length-prefixed chunked HTTP, can run for minutes per request). Same path, same port, both transports.
- **Long-lived ffmpeg children.** 3 concurrent jobs maximum, 5 s SIGTERM → SIGKILL grace, 30 s orphan timeout (`server/src/config.ts`, lines 63–71). Per-job process supervision lives in `server/src/services/ffmpegFile.ts`.
- **Pinned `jellyfin-ffmpeg` per OS.** `scripts/ffmpeg-manifest.json` pins `7.1.3-5` with per-platform SHA256s. Today's install strategies branch by OS:
  - Linux → `deb-install` → `/usr/lib/jellyfin-ffmpeg/`
  - macOS / Windows → `portable-tarball` / `portable-zip` → `vendor/ffmpeg/<platform>/`
  Resolved once at startup via `server/src/services/ffmpegPath.ts` (memoised `setFfmpegPath`; the `setFfmpegPath`-called-once invariant is structural — see [`02-Fluent-FFmpeg-Quirks.md`](../../server/Hardware-Acceleration/02-Fluent-FFmpeg-Quirks.md)).
- **Hardware acceleration is Linux-only.** macOS (VideoToolbox) and Windows (QSV / NVENC / AMF) are *fatal stubs* in `server/src/services/hwAccel.ts`. Probe failure is fatal under `HW_ACCEL=auto` ([`00-Overview.md`](../../server/Hardware-Acceleration/00-Overview.md)).
- **Filesystem writes default to `tmp/`.** `tmp/xstream.db` for the DB, `tmp/segments/` for the 20 GB LRU segment cache. Both paths are env-overridable via `DB_PATH`, `SEGMENT_DIR`, `SEGMENT_CACHE_GB` ([`00-AppConfig.md`](../../server/Config/00-AppConfig.md)).
- **No library-add UI.** Libraries live in the `libraries` DB table, populated either via the `addLibrary` GraphQL mutation or via `mediaFiles.json` at project root (env-keyed by `NODE_ENV`, machine-specific absolute paths).
- **OTel / OTLP outbound.** Defaults to `http://localhost:5341/ingest/otlp` (Seq), overridable via `OTEL_EXPORTER_OTLP_ENDPOINT`.
- **Client → server URL is relative.** `client/src/relay/environment.ts` uses `/graphql` for HTTP and `${wsProtocol}//${window.location.host}/graphql` for WS. **Implication:** client and server must share an origin in production. The Bun server **does not currently serve client static assets** — `server/src/index.ts` handles `/graphql` and `/stream/*` only; everything else 404s. A shell wrapper must either (a) add a static handler to the Bun server, or (b) have the shell load `client/dist/index.html` directly and expect the Relay environment to talk to `http://localhost:<port>` for GraphQL + stream. This is a real gap and the first thing to fix.
- **Signal handling.** SIGTERM and SIGINT both trigger graceful shutdown (`server/src/index.ts`, lines 118–131). The shell must give the process a few seconds before force-kill or in-flight ffmpeg children become orphans.

## 2. Shell candidates evaluated

Three serious candidates, two also-rans. Each gets an even-handed read on architecture fit / sidecar / OS / signing / updates / maturity.

### Electron + Bun-as-sidecar

- **Architecture fit: native.** Renderer is Chromium, so it loads `http://127.0.0.1:<port>/` like any browser. `/graphql` HTTP+WS and `/stream/:jobId` length-prefixed binary need *zero* changes — no transport-layer surprises.
- **Sidecar.** `child_process.spawn` from main process is the most-trodden pattern in desktop apps (Postman, GitHub Desktop, many others run a long-lived Node / Bun / Go server alongside the UI). `extraResources` config bundles the Bun binary + jellyfin-ffmpeg cleanly per OS, matching the `vendor/ffmpeg/<platform>/` shape from [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) §4.
- **OS coverage.** macOS universal, Windows x64 + arm64, Linux x64 + arm64.
- **Signing.** `electron-builder` documents macOS Developer ID + notarization, Windows Authenticode, Linux AppImage / deb / rpm. Production-grade across all three.
- **Updates.** `electron-updater` is mature — Squirrel.Mac, NSIS-web (delta), AppImage updates; signed manifests; channels first-class.
- **Maturity.** Production. Reputation hit overstated — VS Code, Slack, Discord, Figma, Linear, 1Password.
- **Cost.** Chromium per OS adds ~150–200 MB; with Bun runtime + ffmpeg, installer ~250–300 MB. Heavier RAM (main + renderer + GPU processes) — but Chromium is what plays the video anyway, so we ship it transitively in any browser-engine scenario.
- **Carryover to Rust + Tauri northstar.** None for the shell glue itself. Signing keys, CI runner matrix, release-tagging convention carry over regardless.

### Tauri shell + Bun-as-sidecar

- **Architecture fit: works, with one verification.** Tauri's webview can load `http://localhost:<port>/`; `tauri-plugin-shell`'s `sidecar` config supports long-lived child processes with stdout / stderr piping. We need to verify Bun-as-sidecar specifically — the pattern is documented for Node / Python / Go, but xstream-scale binary streaming through it isn't a reference example we can point at.
- **Sidecar.** Sidecar binary registered in `tauri.conf.json`, lifecycle bound to app launch / quit. ffmpeg children spawned by Bun work as in any other context — Tauri does not sandbox the sidecar's children.
- **OS, signing, updates.** Same matrix as Electron. `tauri-plugin-updater` uses Ed25519-signed JSON manifests on a static origin (S3 / R2 / GH Releases); per-OS bundlers (`.dmg`, `.msi` / `.exe`, `.AppImage` / `.deb` / `.rpm`) are first-class.
- **Maturity.** Production. Smaller install base than Electron but real.
- **Cost.** Small Rust shell (~5–10 MB) + Bun runtime (~100 MB) + ffmpeg → installer ~120–180 MB. Lighter RAM than Electron because the system webview is shared.
- **Carryover to Rust + Tauri northstar.** Highest of any option. Same shell, same updater, same signing, same bundler. Only the sidecar binary gets replaced (Bun → in-process Rust server) at migration time.

### Electrobun + Bun main process

- **Architecture fit: unverified, two open questions.** Their docs explicitly cover postMessage / FFI / encrypted-WS as IPC mechanisms — but **subprocess support and localhost-HTTP-server binding are undocumented**. Our protocol depends on both. We would be the proving case.
- **Sidecar.** Undocumented. Verifying `Bun.spawn()` works for ffmpeg children and that `Bun.serve()` can bind a port the webview reaches is a precondition.
- **OS coverage.** macOS universal, Windows x64 only (no arm64), Linux x64 + arm64. Linux distribution format unspecified in docs.
- **Signing.** macOS Developer ID + notarization documented (env-var driven). **Windows Authenticode and Linux signing absent from current docs.**
- **Updates.** BSDIFF + Zig SIMD; 14 KB patch sizes for a 14 MB shell. Single forward-patch per build cycle — users skipping versions auto-fall-back to a full `.tar.zst`. Self-hosted manifest. Quirk: GH `/releases/latest/download` ignores prereleases, breaking canary on that origin.
- **Maturity.** Not stated. No version pinning, no stability disclaimer. **Treat as alpha / beta.** The 14 MB bundle marketing is real but does not include our stack — Bun runtime + ffmpeg dominate the on-disk footprint regardless.
- **Carryover to northstar.** None.

### Also-rans

- **`bun build --compile` + system browser.** Single binary, no shell. User opens `http://localhost:<port>/` in their default browser. No app-icon UX, no auto-update, Windows SmartScreen trips on an unsigned `.exe`. Useful as a power-user channel; not the primary story.
- **NW.js / neutralinojs.** Neither has a richer sidecar / updater story than the three above. Skipping.

## 3. Recommendation — a real trade-off, not a single decree

| Option                       | Compatibility risk | Migration carryover    | Bundle size  | Tooling maturity | Verdict for *interim* |
|------------------------------|--------------------|------------------------|--------------|------------------|------------------------|
| Electron + Bun sidecar       | **none**           | low (signing / CI only) | ~250–300 MB | highest          | safest pick            |
| Tauri + Bun sidecar          | low (one verify)   | **highest**            | ~120–180 MB  | high             | best long-term fit     |
| Electrobun + Bun main        | high (two unknowns)| none                   | ~120 MB      | alpha / beta     | not yet                |

The honest call, stated as a trade-off rather than a decree:

- **Pick Electron** if "ship interim now, throw it away cleanly when Rust + Tauri lands" is the priority. Mature signing / updater / CI on every OS, zero compatibility risk for the HTTP + WS + binary-stream surface, every quirk has been hit before by some shipped app. Cost: ~150 MB extra installer and shell glue gets discarded at migration.
- **Pick Tauri-with-Bun-sidecar** if maximizing migration carryover matters more than minimizing interim risk. Same shell as the northstar — every signing key, updater manifest, bundle config, CI runner step is reused. Cost: one architecture verification (Bun-as-Tauri-sidecar with binary streaming through it), and the sidecar pattern is less battle-tested than Electron's `child_process.spawn`.
- **Don't pick Electrobun yet.** The two undocumented areas (subprocess + localhost HTTP) sit on the critical path of the streaming protocol. Mac-only signing docs are a real gap. Re-evaluate when Electrobun's docs cover sidecars and Windows / Linux signing.

One-line summary: **Electron if shipping speed and risk-minimization win; Tauri-with-Bun-sidecar if carryover to the Rust port wins.** Both are defensible.

### Verification gates per option

Before committing to any shell, the corresponding gate must pass:

- *Electron:* spike a Bun sidecar with the `/stream/:jobId` flow and confirm Squirrel / NSIS-web delta updates produce reasonable patch sizes for the installer. Chromium dominates the bundle, so deltas may be smaller than expected.
- *Tauri-with-Bun-sidecar:* spike Bun-as-sidecar with binary streaming through it, confirming no Tauri IPC layer is in the request path. (The migration spec rejects Tauri IPC for the *Rust* server in [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) §3 because event JSON serialization breaks `/stream/:jobId` framing — same reasoning applies to a Bun sidecar.)
- *Electrobun:* confirm subprocess lifecycle, `Bun.serve()` binding + webview localhost loading, and a working Windows signing flow.

## 4. Caveats

These apply regardless of shell choice. Any one of them, ignored, breaks the desktop build.

1. **Static assets aren't served by the Bun server today.** `server/src/index.ts` only handles `/graphql` and `/stream/*`. Either add a static handler there (preferred — keeps client-server URL discovery via `window.location.host` working uniformly) or have the shell serve `client/dist/` separately. Electron's `BrowserWindow.loadFile()` makes the second path easy; Tauri's `distDir` does too. Without one of these, the webview has nothing to load.
2. **Hardware accel is Linux-only and *fatal* on mac / win in the current code.** `hwAccel.ts` exits on macOS / Windows under `HW_ACCEL=auto`. Interim desktop on those OSes ships with `HW_ACCEL=off` and software libx264, which stalls at 4K. Decide between (a) accepting a 1080p ceiling on mac / win and (b) implementing at least one hardware path before shipping. **This is the single biggest product risk.**
3. **`deb-install` strategy for ffmpeg breaks for end users** — assumes `apt`. All three OSes need to switch to portable-bundled ffmpeg under `vendor/ffmpeg/<platform>/`, the same shape [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) §4 uses for the Rust port. `setup-ffmpeg --target=tauri-bundle` (per the Rust port doc) is the model.
4. **Filesystem paths default to `tmp/` relative to CWD** — that's a dev convention. The shell must redirect `DB_PATH` → `<app_data_dir>/xstream.db` and `SEGMENT_DIR` → `<app_cache_dir>/segments` per OS. Resolvers: Electron's `app.getPath('userData')` / `app.getPath('cache')`, Tauri's `BaseDirectory::AppLocalData` / `AppCache`, Electrobun's equivalents (less documented).
5. **No library-add UI exists.** `mediaFiles.json` is committed at project root with absolute machine paths — useless for a normal user. **Minimum viable shell needs a "pick folder" button** that calls the existing `addLibrary` GraphQL mutation. Without this, the desktop build is unusable.
6. **OTel endpoint defaults to localhost Seq.** Production builds must either (a) set `OTEL_EXPORTER_OTLP_ENDPOINT` to a remote backend, (b) disable the exporter, or (c) ship Seq alongside (no — too heavy). Recommend (b) with opt-in (a) via a settings toggle.
7. **VAAPI on Linux requires `/dev/dri/renderD128` + `render` / `video` group membership.** The current code makes probe failure fatal ([`00-Overview.md`](../../server/Hardware-Acceleration/00-Overview.md)). The migration spec already plans to soften this to a one-time toast under Tauri ([`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) §5); the same softening is needed for any interim shell.
8. **No `version` field exists in any `package.json`** and there is no release-tagging convention. Adding both is a precondition for any updater to work.
9. **Bun is not statically linked.** The shell must bundle the Bun runtime — either via `bun build --compile` (single binary, ~110–150 MB) or by shipping the runtime alongside the entrypoint. Final installer size: ~100–150 MB for the prototype shell, before content.

## 5. Distribution across OSs

Per-OS bundle formats and architectures by shell:

| OS         | Electron (`electron-builder`)            | Tauri                          | Electrobun                  |
|------------|------------------------------------------|--------------------------------|-----------------------------|
| macOS      | `.dmg`, `.zip`                           | `.dmg`, `.app.tar.gz`          | `.app` + custom updater     |
| Windows    | `.exe` (NSIS, Squirrel), `.msi` (WiX)    | `.msi` (WiX), `.exe` (NSIS)    | `.exe` (format unspecified) |
| Linux      | `.AppImage`, `.deb`, `.rpm`, `.snap`     | `.AppImage`, `.deb`, `.rpm`    | unspecified in docs         |
| Architectures | mac universal, win x64+arm64, linux x64+arm64 | same                  | mac universal, win x64 only, linux x64+arm64 |

Signing requirements are platform-level, not shell-specific:

- **macOS.** Apple Developer ID Application cert + `notarytool` notarization (mandatory for Gatekeeper). Hardened runtime + entitlements for `com.apple.security.cs.allow-jit` if Bun's JIT trips the runtime.
- **Windows.** Authenticode cert. OV is fine; EV avoids SmartScreen warm-up. `signtool sign /tr <timestamp> /td sha256 /fd sha256`.
- **Linux.** No OS-mandated signing. AppImage signature via `gpg` / Ed25519; `.deb` / `.rpm` signed for repo distribution.

Cross-compilation: **none viable for any shell.** All three require a CI runner native to each target OS.

## 6. Updates

Per-shell auto-update story.

### Electron — `electron-updater`

- Backed by Squirrel.Mac (mac), NSIS-web (win), `.AppImage` self-update + GenericProvider (linux).
- Self-hosted manifest (`latest.yml` + per-OS variants) on any static origin. GitHub Releases provider built-in.
- **Delta updates** on Windows via NSIS-web (binary diffs against installed bundle); full bundles on mac / linux. Realistic delta sizes for a Chromium-heavy bundle: ~10–50 MB.
- **Channels** (`stable` / `beta` / `alpha`) are first-class — controlled by `provider` config + per-channel manifest paths.
- **Signature verification** is mandatory on macOS (codesign chain) and Windows (Authenticode); the updater refuses unsigned payloads.
- **Rollback.** Not built in; users reinstall a previous version manually. Acceptable for prototype.

### Tauri — `tauri-plugin-updater`

- JSON manifest on a static origin (S3 / R2 / GitHub Releases). Manifest lists per-OS payloads + Ed25519 signatures.
- Updater payload formats: `.app.tar.gz` (mac), `.msi` (win), `.AppImage` (linux). Tauri verifies Ed25519 before applying.
- **Full bundles only** — no built-in delta. Realistic sizes for shell + Bun + ffmpeg: ~120–180 MB per update.
- **Channels.** Stable vs beta via separate manifest URLs.
- **Rollback.** Same as Electron — manual.

### Electrobun — BSDIFF + Zig SIMD

- 14 KB patches for a 14 MB shell. **Single forward-patch per build cycle**; if a user skips a version, falls back to a full `.tar.zst`. For our stack the patch advantage is reduced — Bun + ffmpeg dominate the bundle, and they don't change every release.
- Self-hosted manifest (S3 / R2 / GH Releases). Quirk: GH `/releases/latest/download` ignores prereleases — breaks canary auto-update on that backend.
- Channels via naming-conventions + `prerelease` flag in GH releases.
- Rollback: not documented.

## 7. CI integration

The current `.github/workflows/ci.yml` is `ubuntu-latest`-only and has no release artifacts. The matrix and sequence below are **shell-agnostic** for everything up to the bundler step.

- **New file:** `.github/workflows/release.yml`, triggered on tag push (`v*.*.*`).
- **Matrix (same regardless of shell):**
  - `macos-14` (arm64) + `macos-13` (x64) → universal `.dmg` (mac universal binary)
  - `windows-latest` (x64) → `.msi` + `.exe`
  - `ubuntu-latest` (x64) + `ubuntu-24.04-arm` (arm64) → `.AppImage` + `.deb`
- **Per-job sequence (shell-agnostic):** checkout → Bun install → `bun run build` (server + client) → `bun run setup-ffmpeg --target=portable` → **shell-specific bundle step** → sign → upload artifact → publish updater manifest.
- **Shell-specific bundle step:**
  - *Electron:* `electron-builder --mac --win --linux` (per-runner) with `extraResources` pointing at the Bun binary + `vendor/ffmpeg/<platform>/`.
  - *Tauri:* `tauri build --target <triple>` with `tauri.conf.json` `bundle.resources` pointing at the Bun sidecar binary + ffmpeg.
  - *Electrobun:* `electrobun build --env=stable` per host (no cross-compile).
- **Secrets to add (overlap heavily across shells):**
  - macOS: `APPLE_CERTIFICATE_P12`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`, `APPLE_API_KEY` (notarization).
  - Windows: `WINDOWS_CERT_P12`, `WINDOWS_CERT_PASSWORD`.
  - Updater (shell-specific name, same shape): `TAURI_SIGNING_PRIVATE_KEY` (Ed25519, Tauri) **or** `CSC_LINK` + provider tokens (electron-updater) **or** `ELECTROBUN_SIGNING_KEY` (Electrobun).
- **Artifact upload** to the GitHub Release. A small "publish updater manifest" step writes the manifest (`latest.yml` for electron-updater, JSON for Tauri / Electrobun) with download URLs + signatures and pushes it to the static origin.
- **The existing `ci.yml` stays as-is** — it is the per-PR validation pipeline. Release is tag-driven and separate.

The scaffolding (matrix, secrets, signing-step shape) carries over between shells if we ever switch — only the bundler invocation and updater secret names change.

## 8. Open questions

Decisions deferred until a shell is chosen and a spike has been run:

- **Which shell?** See §3 for the trade-off. Pick by weighting "ship-now-with-zero-risk" vs "carryover-to-northstar."
- **Static asset serving.** Add a static handler in `server/src/index.ts` (uniform with dev) or have the shell serve `client/dist/` directly (less server change). Decision deferred — depends on shell.
- **Hardware accel on mac / win.** Accept 1080p ceiling for interim, or implement at least one hardware backend (VideoToolbox, NVENC, QSV) before shipping. The `hwAccel.ts` tagged-union shape ([`00-Overview.md`](../../server/Hardware-Acceleration/00-Overview.md)) makes the latter additive but non-trivial.
- **Library picker UX.** A "pick folder" button calling `addLibrary` is the floor. Whether it lives in the existing settings page or a first-run flow is a design call.
- **Update signing keys.** Where does the Ed25519 / Authenticode private key live? Likely 1Password Secrets Automation → GitHub Actions secret. Decision deferred to release-engineering.
- **Update channel strategy.** Probably `stable` only at first; add `beta` once an updater is wired and we have a soak group.

## 9. Invariants — what every interim shell must preserve

The Rust + Tauri port already enumerates client-side invariants in [`00-Rust-Tauri-Port.md`](../../migrations/rust-rewrite/00-Rust-Tauri-Port.md). The interim shell must preserve a strict subset:

1. **Client code unchanged.** No edits to `client/src/relay/environment.ts` or to any Relay fragment to make the shell work. The shell makes the URL `window.location.host` resolves to be the local Bun server, full stop.
2. **`/stream/:jobId` framing untouched.** Length-prefixed binary chunks pass through the shell as raw HTTP. Any IPC layer that JSON-serializes the body breaks the protocol — same reasoning as [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md) §3 rejects Tauri IPC for the Rust server.
3. **`setFfmpegPath` called once at startup.** The interim shell does not re-invoke `setFfmpegPath` from a separate path; the `services/ffmpegPath.ts` memoised resolver remains the only writer ([`02-Fluent-FFmpeg-Quirks.md`](../../server/Hardware-Acceleration/02-Fluent-FFmpeg-Quirks.md)).
4. **OTel traceparent threading preserved.** The shell does not strip headers from in-process loopback requests; client → server traceparent continues to flow.
5. **DB and segment cache paths configurable via env, not hard-coded.** The shell sets `DB_PATH` / `SEGMENT_DIR` / `SEGMENT_CACHE_GB` before launching the server; the server itself does not learn it is "running under a shell."
6. **Graceful shutdown honoured.** SIGTERM / SIGINT receive a 5+ second window before force-kill, so ffmpeg children get cleaned up.
