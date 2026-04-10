import { createHash } from "crypto";
import { mkdir, watch, stat } from "fs/promises";
import { join, resolve } from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { config, RESOLUTION_PROFILES } from "../config.js";
import { getJob, setJob } from "./jobStore.js";
import { insertJob, updateJobStatus } from "../db/queries/jobs.js";
import { insertSegment } from "../db/queries/segments.js";
import { getVideoById } from "../db/queries/videos.js";
import type { Resolution, ActiveJob } from "../types.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

function jobId(videoPath: string, resolution: Resolution, start?: number, end?: number): string {
  return createHash("sha1")
    .update(`${videoPath}|${resolution}|${start ?? ""}|${end ?? ""}`)
    .digest("hex");
}

export async function startTranscodeJob(
  videoId: string,
  resolution: Resolution,
  startTimeSeconds?: number,
  endTimeSeconds?: number
): Promise<ActiveJob> {
  const video = getVideoById(videoId);
  if (!video) throw new Error(`Video not found: ${videoId}`);

  const id = jobId(video.path, resolution, startTimeSeconds, endTimeSeconds);

  // Return existing job if already running or complete
  const existing = getJob(id);
  if (existing && existing.status !== "error") return existing;

  const profile = RESOLUTION_PROFILES[resolution];
  const segmentDir = resolve(config.segmentDir, id);
  await mkdir(segmentDir, { recursive: true });

  const now = new Date().toISOString();
  const job: ActiveJob = {
    id,
    video_id: videoId,
    resolution,
    status: "pending",
    segment_dir: segmentDir,
    total_segments: null,
    completed_segments: 0,
    start_time_seconds: startTimeSeconds ?? null,
    end_time_seconds: endTimeSeconds ?? null,
    created_at: now,
    updated_at: now,
    error: null,
    segments: [],
    initSegmentPath: null,
    subscribers: new Set(),
  };

  insertJob(job);
  setJob(job);

  // Start transcoding asynchronously
  runFfmpeg(job, video.path, profile, segmentDir, startTimeSeconds, endTimeSeconds);

  return job;
}

function runFfmpeg(
  job: ActiveJob,
  inputPath: string,
  profile: (typeof RESOLUTION_PROFILES)[Resolution],
  segmentDir: string,
  startTime?: number,
  endTime?: number
): void {
  job.status = "running";
  updateJobStatus(job.id, "running");

  const maxBitrate = `${Math.round(parseInt(profile.videoBitrate) * 1.2)}k`;
  const bufSize = `${Math.round(parseInt(profile.videoBitrate) * 2)}k`;
  const outputPattern = join(segmentDir, "segment_%04d.m4s");
  const initPath = join(segmentDir, "init.mp4");

  let command = ffmpeg(inputPath);

  if (startTime !== undefined) command = command.seekInput(startTime);
  if (endTime !== undefined) command = command.duration(endTime - (startTime ?? 0));

  command
    .videoCodec("libx264")
    .outputOptions([
      `-profile:v high`,
      `-level:v ${profile.h264Level}`,
      `-b:v ${profile.videoBitrate}`,
      `-maxrate ${maxBitrate}`,
      `-bufsize ${bufSize}`,
      `-vf scale=${profile.width}:${profile.height}`,
      `-g 48`,
      `-keyint_min 48`,
      `-sc_threshold 0`,
    ])
    .audioCodec("aac")
    .outputOptions([
      `-b:a ${profile.audioBitrate}`,
    ])
    .outputOptions([
      `-movflags frag_keyframe+empty_moov+default_base_moof`,
      `-f segment`,
      `-segment_time ${profile.segmentDuration}`,
      `-segment_format mp4`,
      `-reset_timestamps 1`,
      `-segment_list ${join(segmentDir, "segments.txt")}`,
      `-segment_list_flags +live`,
    ])
    .output(outputPattern)
    .on("start", (cmd) => {
      console.log(`[chunker] Job ${job.id} started`);
      // Generate init segment after first segment appears
      watchSegments(job, segmentDir, initPath);
    })
    .on("error", (err) => {
      console.error(`[chunker] Job ${job.id} error:`, err.message);
      job.status = "error";
      job.error = err.message;
      updateJobStatus(job.id, "error", { error: err.message });
      notifySubscribers(job);
    })
    .on("end", () => {
      console.log(`[chunker] Job ${job.id} complete. ${job.segments.length} segments`);
      job.status = "complete";
      job.total_segments = job.segments.length;
      updateJobStatus(job.id, "complete", {
        total_segments: job.segments.length,
        completed_segments: job.segments.length,
      });
      notifySubscribers(job);
    })
    .run();
}

async function watchSegments(job: ActiveJob, segmentDir: string, initPath: string): Promise<void> {
  const seenFiles = new Set<string>();

  try {
    const watcher = watch(segmentDir);
    for await (const event of watcher) {
      if (job.status === "error") break;

      const filename = event.filename;
      if (!filename) continue;

      // Track numbered segment files
      if (/^segment_\d{4}\.m4s$/.test(filename) && !seenFiles.has(filename)) {
        seenFiles.add(filename);
        const fullPath = join(segmentDir, filename);

        try {
          const fileStat = await stat(fullPath);
          const index = parseInt(filename.replace("segment_", "").replace(".m4s", ""), 10);

          job.segments[index] = fullPath;
          job.completed_segments = job.segments.filter(Boolean).length;

          // Extract init segment from the first .m4s if not yet done
          if (index === 0 && !job.initSegmentPath) {
            await extractInitSegment(fullPath, initPath, job);
          }

          insertSegment({
            job_id: job.id,
            segment_index: index,
            path: fullPath,
            duration_seconds: null,
            size_bytes: fileStat.size,
          });

          updateJobStatus(job.id, job.status, { completed_segments: job.completed_segments });
          notifySubscribers(job);
        } catch {
          // File might not be fully written yet; it will be caught on next event
        }
      }

      if (job.status === "complete") break;
    }
  } catch (err) {
    console.warn(`[chunker] Watcher ended for job ${job.id}:`, (err as Error).message);
  }
}

async function extractInitSegment(firstSegmentPath: string, initPath: string, job: ActiveJob): Promise<void> {
  return new Promise((resolve) => {
    ffmpeg(firstSegmentPath)
      .outputOptions([
        "-c copy",
        "-t 0",
        "-movflags frag_keyframe+empty_moov",
      ])
      .output(initPath)
      .on("end", () => {
        job.initSegmentPath = initPath;
        console.log(`[chunker] Init segment written for job ${job.id}`);
        resolve();
      })
      .on("error", () => resolve()) // non-fatal
      .run();
  });
}

function notifySubscribers(job: ActiveJob): void {
  for (const controller of job.subscribers) {
    try {
      controller.enqueue(null); // signal update — stream.ts reads job state directly
    } catch {
      job.subscribers.delete(controller);
    }
  }
}
