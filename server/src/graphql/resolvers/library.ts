import { countMatchedByLibrary } from "../../db/queries/videoMetadata.js";
import {
  countVideosByLibrary,
  getVideosByLibrary,
  sumFileSizeByLibrary,
  type VideoFilter,
} from "../../db/queries/videos.js";
import type { MediaType } from "../../types.js";
import { gqlMediaTypeToInternal } from "../mappers.js";
import {
  decodeCursor,
  encodeCursor,
  type GQLLibrary,
  type GQLVideo,
  presentVideo,
} from "../presenters.js";

/** Maximum page size for paginated queries. */
const MAX_PAGE_SIZE = 100;

export const libraryResolvers = {
  Library: {
    stats(parent: GQLLibrary): {
      totalCount: number;
      matchedCount: number;
      unmatchedCount: number;
      totalSizeBytes: number;
    } {
      const libraryId = parent._raw.id;
      const total = countVideosByLibrary(libraryId);
      const { matched, unmatched } = countMatchedByLibrary(libraryId);
      const totalSizeBytes = sumFileSizeByLibrary(libraryId);

      return {
        totalCount: total,
        matchedCount: matched,
        unmatchedCount: unmatched,
        totalSizeBytes,
      };
    },

    videos(
      parent: GQLLibrary,
      {
        first = 20,
        after,
        search,
        mediaType,
      }: { first?: number; after?: string; search?: string; mediaType?: string }
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
      const filter: VideoFilter = {
        search: search ?? undefined,
        mediaType: mediaType ? (gqlMediaTypeToInternal(mediaType) as MediaType) : undefined,
      };
      const rows = getVideosByLibrary(libraryId, limit, offset, filter);
      const total = countVideosByLibrary(libraryId, filter);

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
};
