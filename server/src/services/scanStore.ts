/**
 * Scan store — tracks whether a library scan is in progress and notifies
 * subscribers when the state changes. Mirrors the jobStore.ts pattern.
 */

export interface ScanProgress {
  scanning: boolean;
  libraryId: string | null;
  done: number | null;
  total: number | null;
}

let scanning = false;
let currentProgress: ScanProgress = { scanning: false, libraryId: null, done: null, total: null };
const listeners = new Set<(progress: ScanProgress) => void>();

export function isScanRunning(): boolean {
  return scanning;
}

export function getCurrentScanProgress(): ScanProgress {
  return currentProgress;
}

export function markScanStarted(): void {
  scanning = true;
  currentProgress = { scanning: true, libraryId: null, done: null, total: null };
  notify();
}

export function markScanProgress(libraryId: string, done: number, total: number): void {
  currentProgress = { scanning: true, libraryId, done, total };
  notify();
}

export function markScanEnded(): void {
  scanning = false;
  currentProgress = { scanning: false, libraryId: null, done: null, total: null };
  notify();
}

function notify(): void {
  for (const fn of listeners) {
    try {
      fn(currentProgress);
    } catch {
      listeners.delete(fn);
    }
  }
}

/**
 * Returns an async iterable that emits progress updates whenever the scan
 * state changes. The iterable runs until the subscriber disposes it via return().
 */
export function subscribeToScan(): AsyncIterable<ScanProgress> {
  return {
    [Symbol.asyncIterator]() {
      let done = false;
      let resolve: ((result: IteratorResult<ScanProgress>) => void) | undefined;
      let pending: { value: ScanProgress } | undefined;

      function listener(value: ScanProgress): void {
        if (done) return;
        if (resolve) {
          const r = resolve;
          resolve = undefined;
          pending = undefined;
          r({ value, done: false });
        } else {
          pending = { value };
        }
      }

      listeners.add(listener);

      return {
        async next(): Promise<IteratorResult<ScanProgress>> {
          if (done) return { value: undefined as never, done: true };
          if (pending) {
            const { value } = pending;
            pending = undefined;
            return { value, done: false };
          }
          return new Promise<IteratorResult<ScanProgress>>((r) => {
            resolve = r;
          });
        },

        async return(): Promise<IteratorResult<ScanProgress>> {
          done = true;
          listeners.delete(listener);
          pending = undefined;
          resolve?.({ value: undefined as never, done: true });
          resolve = undefined;
          return { value: undefined as never, done: true };
        },
      };
    },
  };
}
