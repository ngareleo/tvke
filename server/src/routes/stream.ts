import { readFile } from "fs/promises";
import { getJob } from "../services/jobStore.js";
import { getJobById } from "../db/queries/jobs.js";
import { getSegmentsByJob } from "../db/queries/segments.js";

function writeLengthPrefixed(controller: ReadableStreamDefaultController, data: Uint8Array): void {
  const header = new Uint8Array(4);
  const view = new DataView(header.buffer);
  view.setUint32(0, data.byteLength, false); // big-endian
  controller.enqueue(header);
  controller.enqueue(data);
}

export async function handleStream(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const jobId = parts[2];
  const fromIndex = parseInt(url.searchParams.get("from") ?? "0", 10);

  if (!jobId) {
    return new Response("Missing jobId", { status: 400 });
  }

  // Try in-memory store first, fall back to DB for completed jobs
  let job = getJob(jobId);
  if (!job) {
    const dbJob = getJobById(jobId);
    if (!dbJob) return new Response("Job not found", { status: 404 });
    if (dbJob.status === "error") return new Response(`Job failed: ${dbJob.error}`, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Re-acquire job reference inside the stream (may have updated)
      const activeJob = getJob(jobId);

      // Wait for init segment
      let attempts = 0;
      while (!activeJob?.initSegmentPath && attempts < 100) {
        await Bun.sleep(100);
        attempts++;
      }

      if (!activeJob?.initSegmentPath) {
        controller.error(new Error("Init segment not ready"));
        return;
      }

      // Send init segment first
      try {
        const initBytes = await readFile(activeJob.initSegmentPath);
        writeLengthPrefixed(controller, new Uint8Array(initBytes));
      } catch (err) {
        controller.error(err);
        return;
      }

      let index = fromIndex;

      // Stream segments as they become available
      while (true) {
        const currentJob = getJob(jobId);

        if (!currentJob) {
          // Job removed from store — serve from DB
          const dbSegments = getSegmentsByJob(jobId);
          for (let i = index; i < dbSegments.length; i++) {
            const segBytes = await readFile(dbSegments[i].path);
            writeLengthPrefixed(controller, new Uint8Array(segBytes));
          }
          break;
        }

        if (index < currentJob.segments.length && currentJob.segments[index]) {
          try {
            const segBytes = await readFile(currentJob.segments[index]);
            writeLengthPrefixed(controller, new Uint8Array(segBytes));
            index++;
          } catch {
            await Bun.sleep(50);
          }
        } else if (currentJob.status === "complete" || currentJob.status === "error") {
          break;
        } else {
          await Bun.sleep(100);
        }

        // Check if client disconnected
        if (req.signal?.aborted) break;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
