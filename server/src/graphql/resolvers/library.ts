import { getVideosByLibrary, countVideosByLibrary } from "../../db/queries/videos.js";
import {
  presentVideo,
  encodeCursor,
  decodeCursor,
  type GQLLibrary,
  type GQLVideo,
} from "../presenters.js";

/** Maximum page size for paginated queries. */
const MAX_PAGE_SIZE = 100;

export const libraryResolvers = {
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
};
