/**
 * Feature-flag registry + module-level cache.
 *
 * Flags persist in the server's `user_settings` key/value table. On app boot,
 * `FeatureFlagsProvider` hydrates this module from a single bulk `settings`
 * query. Once hydrated, `getFlag(key, default)` returns the current value
 * synchronously — which lets non-React code (e.g. `PlaybackController`) read
 * the same values as React components via `useFeatureFlag`.
 *
 * To add a new flag: append an entry to `FLAG_REGISTRY` below. The FlagsTab in
 * Settings renders from the registry automatically, and the server persists
 * values through the existing `setSetting` mutation. Flags are grouped by
 * `category` and displayed together in the UI.
 */

import { type BufferConfig, DEFAULT_BUFFER_CONFIG } from "~/services/BufferManager.js";

export type FlagValueType = "boolean" | "number";
export type FlagValue = boolean | number;
export type FlagCategory = "playback" | "telemetry" | "ui" | "experimental";

export interface FlagDescriptor {
  /** Storage key used in `user_settings`. Must start with `flag.` for booleans
   *  and `config.` for tunable numbers — purely a naming convention, no
   *  enforcement — so the UI can visually group them. */
  key: string;
  name: string;
  description: string;
  valueType: FlagValueType;
  defaultValue: FlagValue;
  category: FlagCategory;
  /** Optional constraints for numeric flags rendered in the FlagsTab. */
  min?: number;
  max?: number;
  step?: number;
}

export const FLAG_KEYS = {
  experimentalBuffer: "flag.experimentalBuffer",
  bufferForwardTargetS: "config.bufferForwardTargetS",
  bufferForwardResumeS: "config.bufferForwardResumeS",
} as const;

export const FLAG_REGISTRY: readonly FlagDescriptor[] = [
  {
    key: FLAG_KEYS.experimentalBuffer,
    name: "Experimental buffer tuning",
    description:
      "When on, the next playback session uses the buffer values below instead of the defaults. Off falls back to DEFAULT_BUFFER_CONFIG.",
    valueType: "boolean",
    defaultValue: false,
    category: "playback",
  },
  {
    key: FLAG_KEYS.bufferForwardTargetS,
    name: "Buffer forward target (s)",
    description: "Pause the stream when bufferedAhead exceeds this many seconds.",
    valueType: "number",
    defaultValue: DEFAULT_BUFFER_CONFIG.forwardTargetS,
    category: "playback",
    min: 2,
    max: 120,
    step: 1,
  },
  {
    key: FLAG_KEYS.bufferForwardResumeS,
    name: "Buffer forward resume (s)",
    description:
      "Resume the stream when bufferedAhead drops below this. Gap to target is the hysteresis width — narrower gaps cause rapid pause/resume churn.",
    valueType: "number",
    defaultValue: DEFAULT_BUFFER_CONFIG.forwardResumeS,
    category: "playback",
    min: 0,
    max: 60,
    step: 1,
  },
];

const cache = new Map<string, FlagValue>();
const subscribers = new Set<() => void>();
let snapshotVersion = 0;

function parseValue(raw: string, valueType: FlagValueType): FlagValue | null {
  if (valueType === "boolean") {
    if (raw === "1" || raw === "true") return true;
    if (raw === "0" || raw === "false") return false;
    return null;
  }
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function serializeValue(value: FlagValue): string {
  return typeof value === "boolean" ? (value ? "1" : "0") : String(value);
}

function notify(): void {
  snapshotVersion++;
  subscribers.forEach((cb) => cb());
}

/** Called once by FeatureFlagsProvider with the server's response. */
export function hydrateFlags(
  entries: readonly { key: string; value: string | null | undefined }[]
): void {
  for (const entry of entries) {
    const desc = FLAG_REGISTRY.find((f) => f.key === entry.key);
    if (!desc || entry.value == null) continue;
    const parsed = parseValue(entry.value, desc.valueType);
    if (parsed !== null) cache.set(entry.key, parsed);
  }
  notify();
}

export function getFlag<T extends FlagValue>(key: string, fallback: T): T {
  const cached = cache.get(key);
  return (cached ?? fallback) as T;
}

/** Optimistic local update — the caller is responsible for persisting via the
 *  `setSetting` mutation. Subscribers are notified so React components re-render. */
export function setFlagLocal(key: string, value: FlagValue): void {
  cache.set(key, value);
  notify();
}

export function subscribeFlags(cb: () => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

/** Snapshot identity used by `useSyncExternalStore`. Bumped whenever a flag
 *  is hydrated or written so React components re-render. */
export function getFlagsSnapshot(): number {
  return snapshotVersion;
}

/**
 * Resolves the effective BufferConfig for a new playback session. Called
 * synchronously by `PlaybackController` at the moment it constructs a
 * `BufferManager`, so toggling the flag takes effect on the *next* playback
 * (current session keeps whatever config it booted with).
 */
export function getEffectiveBufferConfig(): BufferConfig {
  const experimental = getFlag<boolean>(FLAG_KEYS.experimentalBuffer, false);
  if (!experimental) return DEFAULT_BUFFER_CONFIG;
  return {
    ...DEFAULT_BUFFER_CONFIG,
    forwardTargetS: getFlag<number>(
      FLAG_KEYS.bufferForwardTargetS,
      DEFAULT_BUFFER_CONFIG.forwardTargetS
    ),
    forwardResumeS: getFlag<number>(
      FLAG_KEYS.bufferForwardResumeS,
      DEFAULT_BUFFER_CONFIG.forwardResumeS
    ),
  };
}
