/**
 * Fake-clock helper for timer-driven tests.
 *
 * Wraps `@sinonjs/fake-timers` and additionally monkey-patches `Bun.sleep`
 * with a `setTimeout`-based shim, because `Bun.sleep` is a runtime primitive
 * that the sinon library cannot intercept directly.
 *
 * Both pieces matter together: production code uses both `setTimeout`
 * (orphan kill, SIGKILL escalation) and `Bun.sleep` (init-wait poll loop,
 * encoder-progress poll), and the test must see the same view of elapsed
 * time across both. Mixing a faked clock with one of them while the other
 * stays on the real wall clock is the drift the project explicitly bans
 * (see `feedback_clock_no_drift.md`).
 *
 * Usage:
 *
 *   import { installClock } from "../../test/clock.js";
 *
 *   describe("...", () => {
 *     let clock: InstalledClock;
 *     beforeEach(() => { clock = installClock(); });
 *     afterEach(() => { clock.uninstall(); });
 *
 *     it("fires at 30s", async () => {
 *       const promise = orphanTimer();
 *       await clock.tickAsync(30_000);
 *       await promise;
 *     });
 *   });
 */
import FakeTimers, { type InstalledClock as SinonInstalledClock } from "@sinonjs/fake-timers";

export interface InstalledClock {
  /** Advance both `Date.now()` and any pending `setTimeout`/`setInterval`/`Bun.sleep` callbacks. */
  tick(ms: number): void;
  /** Async variant — yields between scheduler ticks so awaited callbacks can resolve before the next slice. */
  tickAsync(ms: number): Promise<void>;
  /** Restore the real clock + the original `Bun.sleep`. Idempotent. */
  uninstall(): void;
  /** Underlying sinon clock, for tests that need its full API (e.g. `runAllAsync`). */
  raw: SinonInstalledClock;
}

export interface InstallClockOpts {
  now?: number | Date;
}

export function installClock(opts: InstallClockOpts = {}): InstalledClock {
  const realSleep = Bun.sleep;
  const sinonClock = FakeTimers.install({
    now: opts.now ?? 0,
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "setImmediate",
      "clearImmediate",
      "Date",
      "queueMicrotask",
    ],
  });
  // Route Bun.sleep through setTimeout so sinon can drive it.
  (Bun as { sleep: (ms: number) => Promise<void> }).sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  let uninstalled = false;
  return {
    tick(ms): void {
      sinonClock.tick(ms);
    },
    async tickAsync(ms): Promise<void> {
      await sinonClock.tickAsync(ms);
    },
    uninstall(): void {
      if (uninstalled) return;
      uninstalled = true;
      sinonClock.uninstall();
      (Bun as { sleep: (ms: number) => Promise<void> }).sleep = realSleep;
    },
    raw: sinonClock,
  };
}
