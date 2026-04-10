import { startTranscodeJob } from "../../services/chunker.js";
import { scanLibraries } from "../../services/libraryScanner.js";
import { gqlResolutionToInternal } from "../mappers.js";
import {
  type GQLLibrary,
  type GQLTranscodeJob,
  presentJob,
  presentLibrary,
} from "../presenters.js";
import { fromGlobalId } from "../relay.js";

export const mutationResolvers = {
  Mutation: {
    async scanLibraries(): Promise<GQLLibrary[]> {
      const rows = await scanLibraries();
      return rows.map(presentLibrary);
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
    ): Promise<GQLTranscodeJob> {
      const { id: localVideoId } = fromGlobalId(videoId);
      const internalResolution = gqlResolutionToInternal(resolution);

      const job = await startTranscodeJob(
        localVideoId,
        internalResolution,
        startTimeSeconds,
        endTimeSeconds
      );

      return presentJob(job);
    },
  },
};
