import type { ActiveJob } from "../types.js";

const store = new Map<string, ActiveJob>();

export function getJob(id: string): ActiveJob | undefined {
  return store.get(id);
}

export function setJob(job: ActiveJob): void {
  store.set(job.id, job);
}

export function removeJob(id: string): void {
  store.delete(id);
}

export function getAllJobs(): ActiveJob[] {
  return Array.from(store.values());
}
