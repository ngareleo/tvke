import { toGlobalId, fromGlobalId } from "../relay.js";
import { getAllLibraries, getLibraryById } from "../../db/queries/libraries.js";
import { getVideoById, getVideosByLibrary, countVideosByLibrary, getStreamsByVideoId } from "../../db/queries/videos.js";
import { getJobById } from "../../db/queries/jobs.js";
import { gqlResolutionToInternal, gqlStatusToInternal, internalResolutionToGql, internalStatusToGql, internalMediaTypeToGql } from "../mappers.js";
import type { LibraryRow, VideoRow, TranscodeJobRow } from "../../types.js";

function encodeCursor(offset: number): string {
  return Buffer.from(`offset:${offset}`).toString("base64");
}

function decodeCursor(cursor: string): number {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  return parseInt(decoded.replace("offset:", ""), 10);
}

function formatLibrary(row: LibraryRow) {
  return {
    id: toGlobalId("Library", row.id),
    name: row.name,
    mediaType: internalMediaTypeToGql(row.media_type),
    _raw: row,
  };
}

function formatVideo(row: VideoRow) {
  return {
    id: toGlobalId("Video", row.id),
    title: row.title ?? row.filename,
    filename: row.filename,
    durationSeconds: row.duration_seconds,
    fileSizeBytes: row.file_size_bytes,
    bitrate: row.bitrate,
    _raw: row,
  };
}

function formatJob(row: TranscodeJobRow) {
  return {
    id: toGlobalId("TranscodeJob", row.id),
    resolution: internalResolutionToGql(row.resolution),
    status: internalStatusToGql(row.status),
    totalSegments: row.total_segments,
    completedSegments: row.completed_segments,
    startTimeSeconds: row.start_time_seconds,
    endTimeSeconds: row.end_time_seconds,
    createdAt: row.created_at,
    error: row.error,
    _raw: row,
  };
}

export const queryResolvers = {
  Query: {
    node(_: unknown, { id }: { id: string }) {
      const { type, id: localId } = fromGlobalId(id);
      if (type === "Library") {
        const row = getLibraryById(localId);
        return row ? { __typename: "Library", ...formatLibrary(row) } : null;
      }
      if (type === "Video") {
        const row = getVideoById(localId);
        return row ? { __typename: "Video", ...formatVideo(row) } : null;
      }
      if (type === "TranscodeJob") {
        const row = getJobById(localId);
        return row ? { __typename: "TranscodeJob", ...formatJob(row) } : null;
      }
      return null;
    },

    libraries() {
      return getAllLibraries().map(formatLibrary);
    },

    video(_: unknown, { id }: { id: string }) {
      const { id: localId } = fromGlobalId(id);
      const row = getVideoById(localId);
      return row ? formatVideo(row) : null;
    },

    transcodeJob(_: unknown, { id }: { id: string }) {
      const { id: localId } = fromGlobalId(id);
      const row = getJobById(localId);
      return row ? formatJob(row) : null;
    },
  },

  Library: {
    videos(parent: ReturnType<typeof formatLibrary>, { first = 20, after }: { first?: number; after?: string }) {
      const offset = after ? decodeCursor(after) + 1 : 0;
      const limit = Math.min(first, 100);
      const libraryId = parent._raw.id;
      const rows = getVideosByLibrary(libraryId, limit, offset);
      const total = countVideosByLibrary(libraryId);

      const edges = rows.map((row, i) => ({
        node: formatVideo(row),
        cursor: encodeCursor(offset + i),
      }));

      return {
        edges,
        totalCount: total,
        pageInfo: {
          hasNextPage: offset + rows.length < total,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
      };
    },
  },

  Video: {
    library(parent: ReturnType<typeof formatVideo>) {
      const row = getLibraryById(parent._raw.library_id);
      return row ? formatLibrary(row) : null;
    },

    videoStream(parent: ReturnType<typeof formatVideo>) {
      const streams = getStreamsByVideoId(parent._raw.id);
      const vs = streams.find((s) => s.stream_type === "video");
      if (!vs) return null;
      return {
        codec: vs.codec,
        width: vs.width!,
        height: vs.height!,
        fps: vs.fps!,
      };
    },

    audioStream(parent: ReturnType<typeof formatVideo>) {
      const streams = getStreamsByVideoId(parent._raw.id);
      const as_ = streams.find((s) => s.stream_type === "audio");
      if (!as_) return null;
      return {
        codec: as_.codec,
        channels: as_.channels!,
        sampleRate: as_.sample_rate!,
      };
    },
  },

  TranscodeJob: {
    video(parent: ReturnType<typeof formatJob>) {
      const row = getVideoById(parent._raw.video_id);
      return row ? formatVideo(row) : null;
    },
  },
};
