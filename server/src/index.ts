import { mkdir } from "fs/promises";
import { config } from "./config.js";
import { getDb } from "./db/index.js";
import { scanLibraries } from "./services/libraryScanner.js";
import { restoreInterruptedJobs } from "./services/jobRestore.js";
import { yoga } from "./routes/graphql.js";
import { handleStream } from "./routes/stream.js";

async function bootstrap(): Promise<void> {
  // Ensure tmp directories exist
  await mkdir(config.segmentDir, { recursive: true });

  // Initialize DB (migrations run inside getDb)
  getDb();
  console.log("[server] Database ready");

  // Restore any jobs that were running when server last died.
  // Jobs whose segment files still exist are restored to memory and marked
  // complete; jobs with no output are marked as error.
  await restoreInterruptedJobs();

  // Scan media libraries
  console.log("[server] Scanning media libraries...");
  await scanLibraries();
  console.log("[server] Library scan complete");

  // Start HTTP server
  Bun.serve({
    port: config.port,
    // Disable idle timeout — the /stream/:jobId endpoint is a long-lived
    // chunked HTTP response and would be killed by the 10s default.
    idleTimeout: 0,

    async fetch(req) {
      const url = new URL(req.url);

      // GraphQL endpoint (handles GET for introspection, POST for queries, WS for subscriptions)
      if (url.pathname === "/graphql" || url.pathname.startsWith("/graphql")) {
        return yoga.handle(req);
      }

      // Binary streaming endpoint
      if (url.pathname.startsWith("/stream/")) {
        return handleStream(req);
      }

      return new Response("Not Found", { status: 404 });
    },

    // TODO: WebSocket subscriptions (graphql-ws) need a dedicated Bun WS upgrade
    // handler. graphql-yoga v5 does not expose a Bun-compatible websocketHandler
    // out of the box — subscriptions currently fall back to SSE.
  });

  console.log(`[server] Listening on http://localhost:${config.port}`);
  console.log(`[server] GraphQL at http://localhost:${config.port}/graphql`);
}

bootstrap().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
