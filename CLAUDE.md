# xstream — Agent Context

High-resolution web streaming. Bun server transcodes video files to fMP4 segments with ffmpeg and streams them over HTTP as length-prefixed binary chunks; the React client renders them via Media Source Extensions. Current phase: 4K/1080p fixed-resolution playback with a full 240p → 4K ladder.

> **Session-start directive:** Before doing task work, read [`docs/SUMMARY.md`](docs/SUMMARY.md) for the shared architecture + coding-style orientation. It's ≤120 lines, owned and maintained by the `architect` subagent.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| HTTP + WS | `Bun.serve()` + `graphql-yoga` + `graphql-ws` |
| DB | `bun:sqlite` — raw SQL only, no ORM |
| Video | `fluent-ffmpeg` + pinned jellyfin-ffmpeg (`scripts/ffmpeg-manifest.json`, per-platform SHA256). VAAPI on Linux; macOS/Windows HW paths stubbed. |
| Client bundler | Rsbuild |
| UI | React 18 + React Router v6 |
| Styles | `@griffel/react` — atomic CSS-in-JS |
| Data fetching | `react-relay` + `relay-compiler` |
| Events | `@nova/react` + `@nova/types` |

## Repo Layout

```
xstream/
├── CLAUDE.md                       # this file — routing index for agents
├── package.json                    # bun workspace root
├── tmp/                            # gitignored — SQLite DB + ffmpeg segment cache
├── docs/                           # knowledge base owned by the architect subagent (see docs/README.md)
│   ├── README.md                   # super-domain index
│   ├── architecture/               # cross-cutting concepts (Streaming, Relay, Observability, Startup, Library-Scan)
│   ├── client/                     # client-only topics (Feature-Flags, Debugging-Playbooks)
│   ├── server/                     # server-only topics (Config, GraphQL-Schema, DB-Schema, Hardware-Acceleration)
│   ├── design/                     # UI design spec
│   ├── product/                    # product spec, customers, roadmap
│   ├── code-style/                 # conventions, invariants, anti-patterns, naming
│   ├── diagrams/                   # .mmd + .png (stable filenames; owned by `update-docs` skill)
│   └── todo.md                     # owned by `todo` skill
│
├── server/src/
│   ├── index.ts                    # Bun.serve() entry + HTTP/WS upgrade + startup sequence
│   ├── config.ts                   # dev/prod AppConfig + RESOLUTION_PROFILES
│   ├── types.ts                    # shared types
│   ├── db/                         # index.ts, migrate.ts, queries/ (one file per table)
│   ├── graphql/                    # schema.ts, relay.ts, mappers.ts, presenters.ts, resolvers/
│   ├── services/                   # libraryScanner, omdbService, scanStore, chunker, jobStore, jobRestore, ffmpegFile, ffmpegPath, hwAccel
│   └── routes/                     # graphql.ts (yoga handler) + stream.ts (GET /stream/:jobId)
│
└── client/src/
    ├── main.tsx router.tsx         # RelayEnvironmentProvider + RouterProvider + NovaEventingProvider
    ├── relay/                      # environment.ts + __generated__/ (gitignored, regenerated)
    ├── styles/tokens.ts            # Moran design tokens
    ├── lib/icons.tsx               # icon exports
    ├── pages/                      # XxxPage.tsx (Suspense shell) + XxxPageContent.tsx (data + layout)
    ├── components/                 # one kebab-case directory per component — colocated .styles.ts, .strings.ts, .events.ts, .stories.tsx
    ├── hooks/                      # useChunkedPlayback, useVideoPlayback, useVideoSync, useJobSubscription, useSplitResize
    ├── services/                   # StreamingService, BufferManager, StreamingLogger
    ├── storybook/                  # withNovaEventing, withLayout, withRelay decorators
    └── utils/                      # pure helpers — formatters, lazy
```

## Code style and invariants

Full content lives under `docs/code-style/`. Agents working on code MUST respect these — they are the non-negotiables, not suggestions.

- [`docs/code-style/Invariants/00-Never-Violate.md`](docs/code-style/Invariants/00-Never-Violate.md) — the 10 structural rules that, if broken, silently corrupt runtime behaviour (SQL routing, MSE state, init-segment order, URL-encoded Relay IDs, one-resolver-per-field, …).
- [`docs/code-style/Naming/00-Conventions.md`](docs/code-style/Naming/00-Conventions.md) — React components vs camelCase everything else.
- [`docs/code-style/Server-Conventions/00-Patterns.md`](docs/code-style/Server-Conventions/00-Patterns.md) — resolver shape, presenter layer, `setFfmpegPath` discipline.
- [`docs/code-style/Client-Conventions/00-Patterns.md`](docs/code-style/Client-Conventions/00-Patterns.md) — Relay fragment contract, Griffel, Nova eventing, localization.
- [`docs/code-style/Anti-Patterns/00-What-Not-To-Do.md`](docs/code-style/Anti-Patterns/00-What-Not-To-Do.md) — the full "don't" list.

## Where to read / who to ask

Most domain knowledge lives in skills, subagents, or `docs/`. The main agent should route — not recite. The `architect` subagent owns the `docs/` knowledge base; prefer asking it before reading `docs/` directly for anything larger than a single file.

| Topic | Go to |
|---|---|
| Architecture, streaming pipeline, backpressure, HW-accel, tech-choice trade-offs, Rust/Tauri plan | `architect` subagent |
| Local dev setup, ffmpeg pinning, env vars, CI/CD, zombie ffmpeg, VAAPI driver gaps, OMDb auto-match | `devops` subagent |
| Any browser interaction (UI verification, Seq inspection, playback checks) | `browser` skill |
| Writing a React component | `write-component` skill |
| Porting a design-lab page to production | `implement-design` skill |
| Feature-flag add/read/remove | `feature-flags` skill |
| Tests (run, analyse, extend) | `test` skill |
| Backend (GraphQL / stream / DB) debugging | `debug-backend` skill |
| End-to-end playback verification | `e2e-test` skill |
| Updating streaming diagrams + docs naming convention | `update-docs` skill |
| Observability / OTel / Seq verification | `otel-logs` skill |
| System overview + component tables | `docs/architecture/00-System-Overview.md` |
| Streaming protocol + playback scenarios | `docs/architecture/Streaming/` |
| Observability (spans, logging policy, Seq) | `docs/architecture/Observability/` |
| Relay fragment contract | `docs/architecture/Relay/` |
| Config (`mediaFiles.json`, AppConfig, resolution profiles) | `docs/server/Config/` |
| GraphQL schema surface | `docs/server/GraphQL-Schema/` |
| DB schema | `docs/server/DB-Schema/` |
| Hardware acceleration (VAAPI, HDR, fluent-ffmpeg quirks) | `docs/server/Hardware-Acceleration/` |
| Feature-flag catalog | `docs/client/Feature-Flags/` |
| Debugging playbooks (client + GraphQL) | `docs/client/Debugging-Playbooks/` |

## Code Quality Tooling

- **Linting:** ESLint v10 + `typescript-eslint` + `eslint-plugin-react-hooks` (client). Each workspace: `bun run lint` → `tsc --noEmit && eslint src`.
- **Formatting:** Prettier v3. `bun run format` (write) / `format:check` (CI).
- **Pre-commit:** Husky v9 + lint-staged auto-fix staged `.ts`/`.tsx`.

Key enforced rules:

- Explicit return types on exported functions (`explicit-module-boundary-types`)
- Floating promises must use `void` or be awaited (`no-floating-promises`)
- Type-only imports use `import type` (`consistent-type-imports`)
- Non-null assertions (`!`) forbidden (`no-non-null-assertion`) — use `?.` or explicit guards (tests post-`expect` excepted)
- React hook rules enforced (`rules-of-hooks: error`, `exhaustive-deps: warn`)
- Cross-module imports use the `~/` alias; `../` is banned via `no-restricted-imports` — same-directory `./` for colocated files is fine

## Observability agent rules

Full policy: [`docs/architecture/Observability/01-Logging-Policy.md`](docs/architecture/Observability/01-Logging-Policy.md). The load-bearing rules:

- Prefer `span.addEvent()` on an existing span over a new span for instantaneous transitions.
- Message bodies must be self-describing — `log.info("Stream paused — 23.4s buffered ahead (target: 20s)", { … })`.
- Levels: `info` = normal lifecycle, `warn` = recoverable, `error` = UX-affecting or a bug.
- Always log WHY on cleanup/kill (standard `kill_reason`: `client_disconnected`, `stream_idle_timeout`, `orphan_no_connection`, `server_shutdown`).
- No duplicate lifecycle logs: one owner per state change.
- Don't cascade errors. Log once, break the loop.
- Client: `getClientLogger` + wrap playback-path fetches with `context.with(getSessionContext(), () => fetch(…))`.
- Server: extract `traceparent` from headers; yoga resolvers receive it as `ctx.otelCtx`.

## Update protocol — notify the architect after changes

Before marking **any task that modified code or docs** as complete, spawn the `architect` subagent with a short change summary:

- **Files changed** — list of paths touched by `Write`/`Edit` during the task.
- **Description** — one sentence on what changed.
- **Why** — rationale (fix, feature, refactor) and a link to the issue or feedback memory if applicable.

Architect then decides whether `docs/`, `SUMMARY.md`, or the architect index needs updating, and does so directly. This keeps the RAG coherent without requiring the caller to know what to update.

**When the rule fires:**

- Any `Write` or `Edit` in `client/`, `server/`, `docs/`, `.claude/`, `CLAUDE.md`, or `README.md` during the task.
- Not fired by: read-only investigation, log inspection, browser verification, test-run observation — observational work doesn't change the baseline.

If the change is genuinely irrelevant to the knowledge base (a typo fix, a lint-only change, a dev-only script tweak), tell architect that explicitly — "files changed: X; no docs impact." Architect will log it and return. This preserves the "always notify" discipline without forcing a doc edit on every commit.

## Skills & Agents index

The full registry is surfaced by the Skill tool at session start. Brief map:

- **Subagents** (`.claude/agents/`): `architect` (knowledge-base curator + design / tech choices), `devops` (dev flow / release / backend ops)
- **Skills** (`.claude/skills/`): `browser`, `write-component`, `implement-design`, `feature-flags`, `test`, `debug-backend`, `debug-ui`, `e2e-test`, `update-docs`, `otel-logs`, `setup-local`, `create-pr`, `resolve-comments`, `reflect`, `todo`, `groom-knowledge-base`

When the user asks about "ultrareview" or how to run it, explain that `/ultrareview` launches a multi-agent cloud review. It is user-triggered and billed; don't attempt to launch it yourself.

When the user asks for `/help` or wants to give feedback, point them at `/help` and `https://github.com/anthropics/claude-code/issues`.
