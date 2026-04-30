/**
 * Backend origin selection for the Rust + Tauri migration cutover.
 *
 * One flag (`useRustBackend`) routes BOTH GraphQL and `/stream/*` to the
 * same backend — Rust on `localhost:3002` when on, Bun on `localhost:3001`
 * (via the rsbuild dev proxy) when off. The two servers are
 * runtime-independent — neither knows about the other's job store, segment
 * cache, or DB writes — so splitting traffic between them produces a
 * 404 / split-brain. They are flipped together as one backend.
 *
 * `featureFlags.ts` populates the in-memory flag cache from `localStorage`
 * synchronously at module load — before `relay/environment.ts` runs — so
 * the GraphQL origin check is reliable at module-init. The streaming check
 * is read at fetch-time, NOT at module-init, so a mid-session flip lands
 * on the very next chunk request.
 */

import { getFlag } from "./featureFlags.js";
import { FLAG_KEYS } from "./flagRegistry.js";

// Rust binds 3002 in dev so it doesn't collide with Bun on 3001.
// Tauri (Step 3) collapses both processes so this constant goes away.
const RUST_HTTP_ORIGIN = "http://localhost:3002";
const RUST_WS_ORIGIN = "ws://localhost:3002";

export function isRustBackendEnabled(): boolean {
  return getFlag<boolean>(FLAG_KEYS.useRustBackend, false);
}

export function graphqlHttpUrl(): string {
  return isRustBackendEnabled() ? `${RUST_HTTP_ORIGIN}/graphql` : "/graphql";
}

export function graphqlWsUrl(): string {
  if (isRustBackendEnabled()) return `${RUST_WS_ORIGIN}/graphql`;
  const proto = globalThis.location?.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${globalThis.location?.host ?? "localhost"}/graphql`;
}

/** `/stream/:jobId` URL for the current backend. Bun and Rust keep
 *  separate segment-cache dirs (`tmp/segments` vs `tmp/segments-rust`) so a
 *  mid-session flip can't see a half-encoded cache from the other side. */
export function streamUrl(jobId: string): string {
  return isRustBackendEnabled() ? `${RUST_HTTP_ORIGIN}/stream/${jobId}` : `/stream/${jobId}`;
}
