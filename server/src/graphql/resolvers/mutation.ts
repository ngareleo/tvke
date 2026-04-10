import { fromGlobalId, toGlobalId } from "../relay.js";
import { scanLibraries } from "../../services/libraryScanner.js";
import { startTranscodeJob } from "../../services/chunker.js";
import { gqlResolutionToInternal, internalResolutionToGql, internalStatusToGql, internalMediaTypeToGql } from "../mappers.js";

export const mutationResolvers = {
  Mutation: {
    async scanLibraries() {
      const rows = await scanLibraries();
      return rows.map((row) => ({
        id: toGlobalId("Library", row.id),
        name: row.name,
        mediaType: internalMediaTypeToGql(row.media_type),
        _raw: row,
      }));
    },

    async startTranscode(
      _: unknown,
      {
        videoId,
        resolution,
        startTimeSeconds,
        endTimeSeconds,
      }: {
        videoId: string;
        resolution: string;
        startTimeSeconds?: number;
        endTimeSeconds?: number;
      }
    ) {
      const { id: localVideoId } = fromGlobalId(videoId);
      const internalResolution = gqlResolutionToInternal(resolution);

      const job = await startTranscodeJob(
        localVideoId,
        internalResolution,
        startTimeSeconds,
        endTimeSeconds
      );

      return {
        id: toGlobalId("TranscodeJob", job.id),
        resolution: internalResolutionToGql(job.resolution),
        status: internalStatusToGql(job.status),
        totalSegments: job.total_segments,
        completedSegments: job.completed_segments,
        startTimeSeconds: job.start_time_seconds,
        endTimeSeconds: job.end_time_seconds,
        createdAt: job.created_at,
        error: job.error,
        _raw: job,
      };
    },
  },
};
