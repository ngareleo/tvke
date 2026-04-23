/**
 * Bun test preload — runs in every test worker before any test file is evaluated.
 *
 * Sets DB_PATH and SEGMENT_DIR to per-PID temp paths so all test files in the
 * same worker share one isolated SQLite + segment cache, but concurrent
 * `bun test` invocations don't collide.
 *
 * SEGMENT_DIR isolation matters because `startTranscodeJob` derives the job
 * cache key from `content_fingerprint + resolution + time range` — without
 * a fresh dir, stale segments from a prior run let it "restore" the cached
 * job and skip re-encoding, silently passing assertions about fresh behaviour.
 */
import { mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const SHARED_TEST_DIR = join(tmpdir(), `xstream-test-${process.pid}`);
mkdirSync(SHARED_TEST_DIR, { recursive: true });
process.env.DB_PATH = join(SHARED_TEST_DIR, "test.db");
process.env.SEGMENT_DIR = join(SHARED_TEST_DIR, "segments");
mkdirSync(process.env.SEGMENT_DIR, { recursive: true });

// Replaces the global TracerProvider with an in-memory one. Must happen
// before any test file imports the chunker, since module-load `getTracer`
// captures the current global provider — see `traceCapture.ts` for details.
import "./traceCapture.js";
