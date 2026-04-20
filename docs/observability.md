# Observability

xstream uses OpenTelemetry (OTel) for structured logs and distributed traces. The telemetry backend is configured entirely through environment variables — switching from local Seq to a cloud provider (Axiom, Grafana Cloud, etc.) requires no code changes.

---

## Architecture

```
Browser (client)
  OTel SDK (sdk-trace-web, sdk-logs)
    BatchSpanProcessor → OTLPTraceExporter  → POST /ingest/otlp/v1/traces
    BatchLogRecordProcessor → OTLPLogExporter → POST /ingest/otlp/v1/logs
              │
              │  Rsbuild dev proxy: /ingest/otlp → http://localhost:5341
              │  (no CORS issues; client credentials stay out of the bundle)
              ▼
Server (Bun)
  OTel SDK (sdk-trace-base, sdk-logs)
    BatchSpanProcessor → OTLPTraceExporter  → OTEL_EXPORTER_OTLP_ENDPOINT/v1/traces
    BatchLogRecordProcessor → OTLPLogExporter → OTEL_EXPORTER_OTLP_ENDPOINT/v1/logs
              │
              ▼
        Seq (dev)  /  Axiom (prod)
```

W3C `traceparent` / `tracestate` headers are injected by the client's fetch instrumentation into every GraphQL request and `/stream/:jobId` request. The server extracts these headers and creates child spans, linking the full client → server trace under a single `traceId`.

---

## What is instrumented

### Server
| Span | Trigger | Key attributes |
|---|---|---|
| `stream.request` | GET /stream/:jobId | `job_id`, `from_index`, `segments_sent` |
| `transcode.job` | startTranscodeJob | `job_id`, `resolution`, `chunk_start_s`, `chunk_duration_s` |
| `library.scan` | scanLibraries | `library_path`, `library_name`, `files_found` |

Structured log events are emitted for each significant state transition (init ready, transcode complete, scan matched, etc.) with a `component` attribute for easy filtering.

### Client
| Span / log | Trigger | Key attributes |
|---|---|---|
| `playback.session` | startPlayback | `video_id`, `resolution` |
| `graphql.request` | every Relay fetch | `operation.name` (via fetch instrumentation) |
| `stream.fetch` | StreamingService /stream/ fetch | `job_id` (via fetch instrumentation) |
| log: `playback.start` | startPlayback called | `video_id`, `resolution`, `duration_s` |
| log: `playback.seek` | seek triggered | `seek_target_s`, `snapped_to_s` |
| log: `playback.stall` | buffering >2s | `stall_duration_ms` |
| log: `playback.resolution_switch` | resolution changed | `from`, `to` |
| log: `playback.error` | any playback error | `message`, `component` |
| Long task spans | task >50ms blocks main thread | `duration_ms` (via instrumentation-long-task) |

---

## Logging Policy

### Core principle: message bodies must be self-describing

A log record's body should read as a complete sentence that tells the story without expanding attributes. A reader skimming Seq should understand what happened from the message alone.

```ts
// Bad — forces you to expand attributes to understand what happened
log.info("Stream paused", { buffered_ahead_s: 23.4 });

// Good — readable in the Seq event list without drilling in
log.info("Stream paused — 23.4s buffered ahead (target: 20s)", { buffered_ahead_s: 23.4, target_s: 20 });
```

Attributes exist for filtering and correlation, not as a substitute for a clear message.

---

### When to use a span vs. a log record

**Use a span** for operations with meaningful duration:
- An HTTP request
- A transcode job (start → complete/error)
- A playback session (play → teardown)
- A long async pipeline step

**Use a log record** for discrete events within a span:
- State transitions (`stream paused`, `init segment sent`, `seek flushed buffer`)
- Errors and warnings at a point in time
- Counters that would be verbose as span attributes (`segments_sent: 47` → periodic log)

**Never** emit a span for something instantaneous. Use `span.addEvent(name, attributes)` on the parent span instead.

---

### Levels

| Level | When to use |
|---|---|
| `info` | Normal lifecycle events — state changes, completions, transitions |
| `warn` | Recoverable problems — quota exceeded and evicted, idle timeout, dedup timeout |
| `error` | Failures that affect the user or indicate a bug — appendBuffer fatal, stream fetch failure, ffprobe crash |

Do not use `info` for errors that will degrade the user experience. Do not use `error` for expected edge cases that are handled gracefully (e.g. `client_disconnected` is `info`, not `error`).

---

### Attributes: what to include

Every log record gets a `component` attribute automatically (set when calling `getClientLogger("name")` or `getOtelLogger("name")`). Beyond that:

- **Always**: the primary entity ID (`job_id`, `video_id`, `library_path`)
- **On errors**: `message` (the error's `.message` string)
- **On durations**: `*_ms` or `*_s` suffixed numeric attributes
- **On counts**: `segment_count`, `segments_sent`, etc.
- **On state changes**: the reason or trigger (`kill_reason`, `ready_state`)

Do not include attributes that duplicate information already in the message body unless they are needed for Seq filtering.

---

### Client-side: always attach session context

All async client logs must carry the active session traceId. This is handled automatically by `getClientLogger` — it reads `getSessionContext()` at emit time. The context is set by `setSessionContext(ctx)` at playback start and cleared by `clearSessionContext()` at teardown.

```ts
// playbackSession.ts — the bridge between OTel context and async callbacks
import { setSessionContext, clearSessionContext } from "~/services/playbackSession.js";

// In startPlayback:
const sessionSpan = playbackTracer.startSpan("playback.session", ...);
setSessionContext(trace.setSpan(context.active(), sessionSpan));

// In teardown:
clearSessionContext();
```

Every `fetch()` call that should link to the playback session must also be wrapped:
```ts
await context.with(getSessionContext(), () => fetch(url, options));
```

Without this, `FetchInstrumentation` injects a new random traceId for each fetch, breaking the server → client link in Seq.

---

### Server-side: propagate incoming trace context

Server spans that handle client requests must extract the `traceparent` from incoming headers and use it as the parent context. Otherwise server spans appear as isolated root traces in Seq instead of children of the client session.

```ts
// In a request handler:
const carrier: Record<string, string> = {};
req.headers.forEach((value, key) => { carrier[key] = value; });
const incomingCtx = propagation.extract(context.active(), carrier);
const span = tracer.startSpan("operation.name", { attributes }, incomingCtx);
```

graphql-yoga resolvers receive the extracted context through `ctx.otelCtx` (set in the yoga `context` function in `routes/graphql.ts`) and pass it to service functions:

```ts
// In a mutation resolver:
const job = await startTranscodeJob(localVideoId, resolution, start, end, ctx.otelCtx);

// In the service function:
const span = tracer.startSpan("transcode.job", { attributes }, parentOtelCtx);
```

---

### Cleanup and termination events

When killing or stopping a pipeline component, always log WHY, not just that it stopped.

```ts
// Bad
log.info("Killing job", { job_id: id });

// Good — reason propagated from the call site
killJob(id, "client_disconnected");
// → logs: "Killing ffmpeg — client_disconnected"
// → span event: transcode_killed { kill_reason: "client_disconnected" }
```

Standard kill reasons: `client_disconnected`, `stream_idle_timeout`, `orphan_no_connection`, `server_shutdown`.

For stream cleanup on the client side, log the segment count at the point of teardown so the message tells the whole story:
```ts
log.info(`Client disconnected after ${sentCount} segments — cleaning up`, { segments_sent: sentCount });
```

---

### Error handling: don't cascade

When a non-recoverable error occurs in a processing loop (e.g. `appendBuffer` on a closed SourceBuffer), log **once** and stop processing. Do not let the outer loop continue picking up items that will all fail identically.

```ts
// After a fatal appendBuffer error:
fatalError = true;
break; // break retry loop

// After the retry loop:
if (fatalError || this.seekAbort) {
  for (const remaining of this.appendQueue) remaining.resolve();
  this.appendQueue = [];
  break; // break the outer drain loop
}
```

One `error` log per failure event. Twenty identical errors mean the loop is not guarded.

---

### What NOT to log

- **Per-segment appends** — too noisy at any real bitrate. Log milestones instead (`every 20 segments` or on completion).
- **Re-scanned existing videos** — only log when a video is newly discovered (`isNew` check before upsert).
- **Successful no-ops** — if a function is called but exits early because nothing changed, log nothing.
- **Timing details that belong in span attributes** — put `encode_duration_ms` on the span, not a separate log record.

---

## Searching in Seq

To find all events for a single playback session:

1. Open [http://localhost:5341](http://localhost:5341)
2. In the search bar, filter by trace ID:
   ```
   @TraceId = 'abc123...'
   ```
3. Or filter by component and time:
   ```
   component = 'chunker' and @Timestamp > 2m ago
   ```
4. Use the **Trace** view to see the parent-child span tree for a given `traceId`

---

## Environment variables

### Server

| Variable | Default | Description |
|---|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:5341/ingest/otlp` | OTLP base URL (no trailing slash, no `/v1/...` path) |
| `OTEL_EXPORTER_OTLP_HEADERS` | _(empty)_ | Comma-separated `Key=Value` headers, e.g. `X-Seq-ApiKey=abc123` |

### Client (baked at build time by Rsbuild)

| Variable | Default | Description |
|---|---|---|
| `PUBLIC_OTEL_ENDPOINT` | `/ingest/otlp` | OTLP base URL for browser. Relative path works in dev (proxied). Use full URL in prod. |
| `PUBLIC_OTEL_HEADERS` | _(empty)_ | Comma-separated `Key=Value` headers for browser OTLP export |

---

## Switching to a production backend

To route telemetry to Axiom in production, update the env vars (no code changes needed):

```bash
# Server
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.axiom.co
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer <axiom-token>,X-Axiom-Dataset=xstream-prod

# Client (set before running bun run build)
PUBLIC_OTEL_ENDPOINT=https://api.axiom.co
PUBLIC_OTEL_HEADERS=Authorization=Bearer <axiom-token>,X-Axiom-Dataset=xstream-prod
```

Axiom accepts OTLP/HTTP natively. Other OTLP-compatible backends (Grafana Cloud, Honeycomb, Jaeger, etc.) follow the same pattern — just change the endpoint and headers.

---

## Seq API key setup

1. Run `bun seq:start` and open [http://localhost:5341](http://localhost:5341)
2. Sign in with the admin password from `.env` (`SEQ_ADMIN_PASSWORD`)
3. Navigate to **Settings → API Keys → Add API Key**
4. Give it a name (e.g. `xstream-dev`), set permissions to **Ingest**
5. Copy the key and add it to `.env`:
   ```
   OTEL_EXPORTER_OTLP_HEADERS=X-Seq-ApiKey=<key>
   PUBLIC_OTEL_HEADERS=X-Seq-ApiKey=<key>
   ```
6. Restart the dev server (`bun run dev`) — telemetry will start flowing immediately

---

## Release-time metrics

See `docs/todo.md` items `OBS-001` through `OBS-004` for the planned metrics instrumentation (buffer rates, error classification, usage metrics). These require the OTel metrics SDK (`MeterProvider`) which is not yet wired up.
