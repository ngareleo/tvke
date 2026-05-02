import { getLibraryById } from "../../db/queries/libraries.js";
import { getMetadataByVideoId, hasVideoMetadata } from "../../db/queries/videoMetadata.js";
import { getStreamsByVideoId } from "../../db/queries/videos.js";
import { internalMediaTypeToGql } from "../mappers.js";
import {
  type GQLLibrary,
  type GQLVideo,
  type GQLVideoMetadata,
  presentLibrary,
  presentVideoMetadata,
} from "../presenters.js";

export const videoResolvers = {
  Video: {
    library(parent: GQLVideo): GQLLibrary | null {
      const row = getLibraryById(parent._raw.library_id);
      return row ? presentLibrary(row) : null;
    },

    mediaType(parent: GQLVideo): string {
      const lib = getLibraryById(parent._raw.library_id);
      return lib ? internalMediaTypeToGql(lib.media_type) : "MOVIES";
    },

    metadata(parent: GQLVideo): GQLVideoMetadata | null {
      const row = getMetadataByVideoId(parent._raw.id);
      return row ? presentVideoMetadata(row) : null;
    },

    matched(parent: GQLVideo): boolean {
      return hasVideoMetadata(parent._raw.id);
    },

    videoStream(
      parent: GQLVideo
    ): { codec: string; width: number; height: number; fps: number } | null {
      const streams = getStreamsByVideoId(parent._raw.id);
      const vs = streams.find((s) => s.stream_type === "video");
      // Return null rather than throwing when ffprobe didn't populate required fields.
      if (!vs || vs.width == null || vs.height == null || vs.fps == null) return null;
      return {
        codec: vs.codec,
        width: vs.width,
        height: vs.height,
        fps: vs.fps,
      };
    },

    audioStream(parent: GQLVideo): { codec: string; channels: number; sampleRate: number } | null {
      const streams = getStreamsByVideoId(parent._raw.id);
      const as_ = streams.find((s) => s.stream_type === "audio");
      if (!as_ || as_.channels == null || as_.sample_rate == null) return null;
      return {
        codec: as_.codec,
        channels: as_.channels,
        sampleRate: as_.sample_rate,
      };
    },

    // M2 fields. Real implementations live in `server-rust/` (Bun is retired for
    // new feature work as of 2026-05-02); these stubs keep the legacy Bun
    // runtime unblocked while the schemas stay in sync.
    nativeResolution(): null {
      return null;
    },
    seasons(): [] {
      return [];
    },
  },
};
