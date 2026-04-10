import { fromGlobalId, toGlobalId } from "../relay.js";
import { getJob } from "../../services/jobStore.js";
import { internalResolutionToGql, internalStatusToGql } from "../mappers.js";
import type { ActiveJob } from "../../types.js";

function formatJob(job: ActiveJob) {
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
}

export const subscriptionResolvers = {
  Subscription: {
    transcodeJobUpdated: {
      subscribe(_: unknown, { jobId }: { jobId: string }) {
        const { id: localId } = fromGlobalId(jobId);
        const job = getJob(localId);
        if (!job) throw new Error(`Job not found: ${jobId}`);

        return {
          [Symbol.asyncIterator]() {
            let resolve: () => void;
            let done = false;

            const controller = {
              enqueue(_: null) {
                resolve?.();
              },
            } as unknown as ReadableStreamDefaultController;

            job.subscribers.add(controller);

            return {
              async next() {
                if (done) return { value: undefined, done: true };

                await new Promise<void>((r) => { resolve = r; });

                const current = getJob(localId);
                if (!current || current.status === "complete" || current.status === "error") {
                  done = true;
                  job.subscribers.delete(controller);
                }

                return {
                  value: { transcodeJobUpdated: current ? formatJob(current) : null },
                  done: false,
                };
              },
              async return() {
                done = true;
                job.subscribers.delete(controller);
                return { value: undefined, done: true };
              },
            };
          },
        };
      },
      resolve(payload: { transcodeJobUpdated: ReturnType<typeof formatJob> | null }) {
        return payload.transcodeJobUpdated;
      },
    },
  },
};
