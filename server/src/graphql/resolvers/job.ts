import { getVideoById } from "../../db/queries/videos.js";
import { type GQLTranscodeJob, type GQLVideo, presentVideo } from "../presenters.js";

export const jobResolvers = {
  TranscodeJob: {
    video(parent: GQLTranscodeJob): GQLVideo | null {
      const row = getVideoById((parent._raw as { video_id: string }).video_id);
      return row ? presentVideo(row) : null;
    },
  },
};
