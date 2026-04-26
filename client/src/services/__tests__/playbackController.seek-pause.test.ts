/**
 * Tests for the seek + spinner + user-pause wiring on PlaybackController.
 * Covers three fixes that landed together:
 *
 *   - waitForStartupBuffer must compare buffered-AHEAD-of-currentTime, not
 *     absolute bufferedEnd, so a seek to 600s that lands a single 2s segment
 *     does NOT trivially satisfy a 5s startup target and trigger an immediate
 *     stall (Change B).
 *   - handleSeeking must reset hasStartedPlayback synchronously, before the
 *     buf.seek().then() runs, so a residual `playing` event fired by the
 *     pre-flush playhead does not flip status back to "playing" via
 *     handlePlaying (Change A).
 *   - handlePlaying must short-circuit while a seek is in flight — defence
 *     in depth against any other code path that fires `playing` mid-seek.
 *   - User pause/play wires a 1s poller (via setInterval) so backpressure
 *     ticks while `timeupdate` is silent (Change D V1).
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PlaybackController } from "~/services/playbackController.js";

// vitest's `environment: node` lacks rAF, but PlaybackTicker references it
// inside `register`. Stub once here — every test in this file uses the
// controller's ticker only as a side-channel; the rAF body is never the
// thing under test.
beforeAll(() => {
  if (typeof globalThis.requestAnimationFrame === "undefined") {
    (
      globalThis as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }
    ).requestAnimationFrame = (): number => 0;
    (globalThis as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame =
      (): void => {};
  }
});

interface FakeBuffer {
  bufferedEnd: number;
  bufferedAhead: number | null;
  setAfterAppend: (cb: (() => void) | null) => void;
  getBufferedAheadSeconds: (t: number) => number | null;
  tickBackpressure: () => void;
  // The afterAppend callback the controller registers — exposed so tests can
  // simulate "a segment was just appended" without spinning a real timer.
  triggerAppend: () => void;
}

interface PrivateController {
  buffer: FakeBuffer | null;
  pipeline: { hasLookahead: () => boolean; resumeLookahead: () => void } | null;
  hasStartedPlayback: boolean;
  isHandlingSeek: boolean;
  status: "idle" | "loading" | "playing";
  userPauseInterval: ReturnType<typeof setInterval> | null;
  userPausePrefetchFired: boolean;
  chunkEnd: number;
  resolution: string;
  waitForStartupBuffer: (buffer: FakeBuffer, target: number, onPlay: () => void) => void;
  handlePlaying: () => void;
  handleUserPause: () => void;
  handleUserPlay: () => void;
}

function makeFakeBuffer(): FakeBuffer {
  let appendCb: (() => void) | null = null;
  const buf: FakeBuffer = {
    bufferedEnd: 0,
    bufferedAhead: null,
    setAfterAppend: (cb): void => {
      appendCb = cb;
    },
    getBufferedAheadSeconds: (): number | null => buf.bufferedAhead,
    tickBackpressure: vi.fn(),
    triggerAppend: (): void => appendCb?.(),
  };
  return buf;
}

function makeController(opts?: { currentTime?: number; durationS?: number }): {
  controller: PlaybackController;
  videoEl: HTMLVideoElement;
} {
  const videoEl = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: opts?.currentTime ?? 0,
    ended: false,
  } as unknown as HTMLVideoElement;
  const controller = new PlaybackController(
    {
      videoEl,
      getVideoId: () => "v-1",
      getVideoDurationS: () => opts?.durationS ?? 1800,
      startTranscodeChunk: vi.fn(),
      recordSession: vi.fn(),
    },
    {
      onStatusChange: vi.fn(),
      onError: vi.fn(),
      onJobCreated: vi.fn(),
    }
  );
  return { controller, videoEl };
}

describe("PlaybackController.waitForStartupBuffer (post-seek stall fix)", () => {
  it("does NOT fire onPlay when bufferedAhead < target, even if absolute bufferedEnd is large", () => {
    // The bug: previous code compared `bufferedEnd >= target`. After a seek
    // to currentTime=600, the first segment lands at PTS≈600 making
    // bufferedEnd≈602 — trivially >= 5. video.play() fires with only ~2s
    // of data ahead and immediately stalls. The fix uses buffered-ahead.
    const { controller, videoEl } = makeController({ currentTime: 600 });
    (videoEl as unknown as { currentTime: number }).currentTime = 600;
    const onPlay = vi.fn();
    const buf = makeFakeBuffer();
    buf.bufferedEnd = 602; // absolute — would have passed old check
    buf.bufferedAhead = 2; // ahead of currentTime — fails new check (target=5)

    (controller as unknown as PrivateController).waitForStartupBuffer(buf, 5, onPlay);
    buf.triggerAppend();

    expect(onPlay).not.toHaveBeenCalled();
  });

  it("fires onPlay once bufferedAhead crosses target", () => {
    const { controller, videoEl } = makeController({ currentTime: 600 });
    (videoEl as unknown as { currentTime: number }).currentTime = 600;
    const onPlay = vi.fn();
    const buf = makeFakeBuffer();
    buf.bufferedEnd = 605;
    buf.bufferedAhead = 5; // exactly at target

    (controller as unknown as PrivateController).waitForStartupBuffer(buf, 5, onPlay);
    buf.triggerAppend();

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPlay when bufferedAhead is null (empty buffer)", () => {
    const { controller } = makeController({ currentTime: 0 });
    const onPlay = vi.fn();
    const buf = makeFakeBuffer();
    buf.bufferedAhead = null;

    (controller as unknown as PrivateController).waitForStartupBuffer(buf, 2, onPlay);
    buf.triggerAppend();

    expect(onPlay).not.toHaveBeenCalled();
  });
});

describe("PlaybackController.handlePlaying (spinner-race fix)", () => {
  it("returns early while isHandlingSeek is true, leaving status unchanged", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.isHandlingSeek = true;
    priv.hasStartedPlayback = true;
    priv.status = "loading";

    priv.handlePlaying();

    expect(priv.status).toBe("loading"); // would have been flipped to "playing" without guard
  });

  it("restores playing status when not seeking and playback has started", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.isHandlingSeek = false;
    priv.hasStartedPlayback = true;
    priv.status = "loading";

    priv.handlePlaying();

    expect(priv.status).toBe("playing");
  });
});

describe("PlaybackController user-pause poller (Change D V1)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("handleUserPause is a no-op until playback has started", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.hasStartedPlayback = false;
    priv.buffer = makeFakeBuffer();

    priv.handleUserPause();

    expect(priv.userPauseInterval).toBeNull();
  });

  it("handleUserPause schedules a 1s interval and ticks backpressure once immediately", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.hasStartedPlayback = true;
    const buf = makeFakeBuffer();
    priv.buffer = buf;
    priv.pipeline = { hasLookahead: () => false, resumeLookahead: vi.fn() };
    priv.chunkEnd = 0; // no next chunk → prefetch path bails

    priv.handleUserPause();

    expect(priv.userPauseInterval).not.toBeNull();
    // Immediate-tick contract: tickBackpressure called synchronously, so the
    // first check happens BEFORE the 1s interval fires.
    expect(buf.tickBackpressure).toHaveBeenCalledTimes(1);
  });

  it("handleUserPlay clears the interval and resumes the lookahead", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.hasStartedPlayback = true;
    priv.buffer = makeFakeBuffer();
    const resumeLookahead = vi.fn();
    priv.pipeline = { hasLookahead: () => false, resumeLookahead };

    priv.handleUserPause();
    expect(priv.userPauseInterval).not.toBeNull();

    priv.handleUserPlay();

    expect(priv.userPauseInterval).toBeNull();
    expect(priv.userPausePrefetchFired).toBe(false);
    expect(resumeLookahead).toHaveBeenCalledTimes(1);
  });

  it("handleUserPause does not stack multiple intervals when called twice", () => {
    const { controller } = makeController();
    const priv = controller as unknown as PrivateController;
    priv.hasStartedPlayback = true;
    priv.buffer = makeFakeBuffer();
    priv.pipeline = { hasLookahead: () => false, resumeLookahead: vi.fn() };

    priv.handleUserPause();
    const first = priv.userPauseInterval;
    priv.handleUserPause();
    expect(priv.userPauseInterval).toBe(first);
  });
});
