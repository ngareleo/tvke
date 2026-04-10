import { mkdir } from "fs/promises";
import { config } from "./config.js";
import { getDb } from "./db/index.js";
import { scanLibraries } from "./services/libraryScanner.js";
import { updateJobStatus } from "./db/queries/jobs.js";
import { getInterruptedJobs } from "./db/queries/jobs.js";
import { yoga } from "./routes/graphql.js";
import { handleStream } from "./routes/stream.js";

async function bootstrap(): Promise<void> {
  // Ensure tmp directories exist
  await mkdir(config.segmentDir, { recursive: true });

  // Initialize DB (migrations run inside getDb)
  getDb();
  console.log("[server] Database ready");

  // Mark any jobs that were running when server last died as errored
  const interrupted = getInterruptedJobs();
  for (const job of interrupted) {
    updateJobStatus(job.id, "error", { error: "Server restarted during transcode" });
    console.warn(`[server] Marked interrupted job as error: ${job.id}`);
  }

  // Scan media libraries
  console.log("[server] Scanning media libraries...");
  await scanLibraries();
  console.log("[server] Library scan complete");

  // Start HTTP server
  const server = Bun.serve({
    port: config.port,

    async fetch(req) {
      const url = new URL(req.url);

      // GraphQL endpoint (handles GET for introspection, POST for queries, WS for subscriptions)
      if (url.pathname === "/graphql" || url.pathname.startsWith("/graphql")) {
        return yoga.handle(req, server);
      }

      // Binary streaming endpoint
      if (url.pathname.startsWith("/stream/")) {
        return handleStream(req);
      }

      return new Response("Not Found", { status: 404 });
    },

    websocket: yoga.websocketHandler as Parameters<typeof Bun.serve>[0]["websocket"],
  });

  console.log(`[server] Listening on http://localhost:${config.port}`);
  console.log(`[server] GraphQL at http://localhost:${config.port}/graphql`);
}

bootstrap().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
