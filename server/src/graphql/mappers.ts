import type { Resolution, JobStatus, MediaType } from "../types.js";

const GQL_TO_RESOLUTION: Record<string, Resolution> = {
  RESOLUTION_240P: "240p",
  RESOLUTION_360P: "360p",
  RESOLUTION_480P: "480p",
  RESOLUTION_720P: "720p",
  RESOLUTION_1080P: "1080p",
  RESOLUTION_4K: "4k",
};

const RESOLUTION_TO_GQL: Record<Resolution, string> = {
  "240p": "RESOLUTION_240P",
  "360p": "RESOLUTION_360P",
  "480p": "RESOLUTION_480P",
  "720p": "RESOLUTION_720P",
  "1080p": "RESOLUTION_1080P",
  "4k": "RESOLUTION_4K",
};

const GQL_TO_STATUS: Record<string, JobStatus> = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETE: "complete",
  ERROR: "error",
};

const STATUS_TO_GQL: Record<JobStatus, string> = {
  pending: "PENDING",
  running: "RUNNING",
  complete: "COMPLETE",
  error: "ERROR",
};

const MEDIA_TYPE_TO_GQL: Record<MediaType, string> = {
  movies: "MOVIES",
  tvShows: "TV_SHOWS",
};

export function gqlResolutionToInternal(gql: string): Resolution {
  const r = GQL_TO_RESOLUTION[gql];
  if (!r) throw new Error(`Unknown resolution enum: ${gql}`);
  return r;
}

export function internalResolutionToGql(r: Resolution): string {
  return RESOLUTION_TO_GQL[r];
}

export function gqlStatusToInternal(gql: string): JobStatus {
  const s = GQL_TO_STATUS[gql];
  if (!s) throw new Error(`Unknown status enum: ${gql}`);
  return s;
}

export function internalStatusToGql(s: JobStatus): string {
  return STATUS_TO_GQL[s];
}

export function internalMediaTypeToGql(m: MediaType): string {
  return MEDIA_TYPE_TO_GQL[m];
}
