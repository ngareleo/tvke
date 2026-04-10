import { fromGlobalId } from "../relay.js";
import { scanLibraries } from "../../services/libraryScanner.js";
import { startTranscodeJob } from "../../services/chunker.js";
import { gqlResolutionToInternal } from "../mappers.js";
import {
  presentLibrary,
  presentJob,
  type GQLLibrary,
  type GQLTranscodeJob,
} from "../presenters.js";

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
