import { fromGlobalId } from "../relay.js";
import { getAllLibraries, getLibraryById } from "../../db/queries/libraries.js";
import {
  getVideoById,
  getVideosByLibrary,
  countVideosByLibrary,
  getStreamsByVideoId,
} from "../../db/queries/videos.js";
import { getJobById } from "../../db/queries/jobs.js";
import {
  presentLibrary,
  presentVideo,
  presentJob,
  encodeCursor,
  decodeCursor,
  type GQLLibrary,
  type GQLVideo,
  type GQLTranscodeJob,
} from "../presenters.js";

/** Maximum page size for paginated queries. */
const MAX_PAGE_SIZE = 100;

export const queryResolvers = {
  Query: {
    node(
      _: unknown,
      { id }: { id: string }
    ): ((GQLLibrary | GQLVideo | GQLTranscodeJob) & { __typename: string }) | null {
      const { type, id: localId } = fromGlobalId(id);
      if (type === "Library") {
        const row = getLibraryById(localId);
        return row ? { __typename: "Library", ...presentLibrary(row) } : null;
      }
      if (type === "Video") {
        const row = getVideoById(localId);
        return row ? { __typename: "Video", ...presentVideo(row) } : null;
      }
      if (type === "TranscodeJob") {
        const row = getJobById(localId);
        return row ? { __typename: "TranscodeJob", ...presentJob(row) } : null;
      }
      return null;
    },

    libraries(): GQLLibrary[] {
      return getAllLibraries().map(presentLibrary);
    },

    video(_: unknown, { id }: { id: string }): GQLVideo | null {
      const { id: localId } = fromGlobalId(id);
      const row = getVideoById(localId);
      return row ? presentVideo(row) : null;
    },

    transcodeJob(_: unknown, { id }: { id: string }): GQLTranscodeJob | null {
      const { id: localId } = fromGlobalId(id);
      const row = getJobById(localId);
      return row ? presentJob(row) : null;
    },
  },

  Library: {
    videos(
      parent: GQLLibrary,
      { first = 20, after }: { first?: number; after?: string }
    ): {
      edges: { node: GQLVideo; cursor: string }[];
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
      };
    } {
      const offset = after ? decodeCursor(after) + 1 : 0;
      const limit = Math.min(first, MAX_PAGE_SIZE);
      const libraryId = parent._raw.id;
      const rows = getVideosByLibrary(libraryId, limit, offset);
      const total = countVideosByLibrary(libraryId);

      const edges = rows.map((row, i) => ({
        node: presentVideo(row),
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
    library(parent: GQLVideo): GQLLibrary | null {
      const row = getLibraryById(parent._raw.library_id);
      return row ? presentLibrary(row) : null;
    },

    videoStream(
      parent: GQLVideo
    ): { codec: string; width: number; height: number; fps: number } | null {
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

    audioStream(parent: GQLVideo): { codec: string; channels: number; sampleRate: number } | null {
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
    video(parent: GQLTranscodeJob): GQLVideo | null {
      const row = getVideoById((parent._raw as { video_id: string }).video_id);
      return row ? presentVideo(row) : null;
    },
  },
};
