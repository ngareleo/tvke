import { StreamingLogger } from "./StreamingLogger.js";

const DEFAULT_FORWARD_BUFFER_TARGET_S = 20;
const BACK_BUFFER_KEEP_S = 5;

export type BufferPauseCallback = () => void;
export type BufferResumeCallback = () => void;

export class BufferManager {
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private objectUrl: string | null = null;
  private videoEl: HTMLVideoElement;
  // Offscreen <video> element used as the MediaSource anchor in background mode
  // (initBackground). Stored on the instance to prevent GC from detaching the
  // MediaSource before buffering is complete. Cleared by promoteToForeground().
  private offscreenVideoEl: HTMLVideoElement | null = null;
  private onPause: BufferPauseCallback;
  private onResume: BufferResumeCallback;
  private appendQueue: Array<{ data: ArrayBuffer; resolve: () => void }> = [];
  private isAppending = false;
  private streamDone = false;
  private forwardTarget: number;
  private forwardResume: number;
  private streamPaused = false;
  private afterAppendCb: (() => void) | null = null;
  private seekAbort = false;
  private videoDurationS: number;

  constructor(
    videoEl: HTMLVideoElement,
    onPause: BufferPauseCallback,
    onResume: BufferResumeCallback,
    videoDurationS = 0,
    forwardTargetSeconds = DEFAULT_FORWARD_BUFFER_TARGET_S
  ) {
    this.videoEl = videoEl;
    this.onPause = onPause;
    this.onResume = onResume;
    this.videoDurationS = videoDurationS;
    this.forwardTarget = forwardTargetSeconds;
    this.forwardResume = forwardTargetSeconds * 0.75;
  }

  /** Buffered end in seconds (0 if nothing buffered yet). */
  get bufferedEnd(): number {
    const sb = this.sourceBuffer;
    if (!sb || sb.buffered.length === 0) return 0;
    return sb.buffered.end(sb.buffered.length - 1);
  }

  init(mimeType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ms = new MediaSource();
      this.mediaSource = ms;
      this.objectUrl = URL.createObjectURL(ms);
      this.videoEl.src = this.objectUrl;

      ms.addEventListener(
        "sourceopen",
        () => {
          try {
            this.sourceBuffer = ms.addSourceBuffer(mimeType);
            this.sourceBuffer.mode = "sequence";
            // Pre-set duration to the full video length so the browser allows
            // seeking anywhere in the video immediately, even before that range
            // is buffered. Without this, videoEl.currentTime is clamped to
            // ms.duration (which starts near 0) and seek targets beyond the
            // currently-buffered end are silently truncated.
            if (this.videoDurationS > 0) {
              ms.duration = this.videoDurationS;
            }
            // Drive back-pressure checks as the video plays forward, so a paused
            // stream gets resumed even when no new segments are being appended.
            this.videoEl.addEventListener("timeupdate", this.handleTimeUpdate);
            StreamingLogger.push({
              category: "BUFFER",
              message: "MSE open — sourceBuffer added (mode=sequence)",
              isError: false,
            });
            resolve();
          } catch (err) {
            StreamingLogger.push({
              category: "BUFFER",
              message: `addSourceBuffer failed: ${(err as Error).message}`,
              isError: true,
            });
            reject(err);
          }
        },
        { once: true }
      );
    });
  }

  /**
   * Register a callback that fires synchronously after each segment is appended
   * to the SourceBuffer. Pass null to unregister. Used by the startup check in
   * useChunkedPlayback to detect when bufferedEnd crosses the startup threshold
   * without relying solely on requestAnimationFrame (which fires too slowly in
   * headless environments such as Playwright).
   */
  setAfterAppend(cb: (() => void) | null): void {
    this.afterAppendCb = cb;
  }

  async appendSegment(data: ArrayBuffer): Promise<void> {
    return new Promise<void>((resolve) => {
      this.appendQueue.push({ data, resolve });
      if (!this.isAppending) {
        void this.drainQueue();
      }
    });
  }

  private async drainQueue(): Promise<void> {
    this.isAppending = true;
    while (this.appendQueue.length > 0) {
      if (this.seekAbort) break;
      const item = this.appendQueue.shift();
      if (item === undefined) break;
      const { data, resolve } = item;
      const sb = this.sourceBuffer;
      if (!sb) {
        resolve();
        break;
      }
      await this.waitForUpdateEnd();
      if (this.seekAbort) {
        resolve();
        break;
      }
      // Retry loop: on QuotaExceededError, evict progressively more buffer space
      // and try again. Without a retry the segment is silently dropped and every
      // subsequent append also fails because the SourceBuffer stays full.
      //
      // Eviction strategy per attempt:
      //   1 — normal back-buffer eviction (currentTime - BACK_BUFFER_KEEP_S)
      //   2 — aggressive: remove everything behind currentTime (no keep window)
      //   3 — nuclear: remove all buffered content
      let appended = false;
      for (let attempt = 0; attempt <= 3 && !appended && !this.seekAbort; attempt++) {
        if (attempt > 0) {
          StreamingLogger.push({
            category: "BUFFER",
            message: `QuotaExceeded (attempt ${attempt}) — evicting and retrying`,
            isError: true,
          });
          if (attempt === 1) {
            await this.evictBackBuffer();
          } else if (attempt === 2) {
            // Remove everything strictly behind currentTime.
            if (sb.buffered.length > 0) {
              const bufStart = sb.buffered.start(0);
              const evictTo = this.videoEl.currentTime;
              if (bufStart < evictTo) {
                await this.waitForUpdateEnd();
                if (!this.seekAbort) {
                  sb.remove(bufStart, evictTo);
                  await this.waitForUpdateEnd();
                }
              }
            }
          } else {
            // Nuclear: remove everything — drastic but better than infinite failure.
            await this.waitForUpdateEnd();
            if (!this.seekAbort) {
              sb.remove(0, Infinity);
              await this.waitForUpdateEnd();
            }
          }
          if (this.seekAbort) break;
        }
        try {
          sb.appendBuffer(data);
          await this.waitForUpdateEnd();
          if (this.seekAbort) break;
          appended = true;
          const bufferedEnd = sb.buffered.length > 0 ? sb.buffered.end(sb.buffered.length - 1) : 0;
          StreamingLogger.push({
            category: "BUFFER",
            message: `Appended ${data.byteLength}B — buffered to ${bufferedEnd.toFixed(2)}s`,
            isError: false,
          });
        } catch (err) {
          if ((err as DOMException).name === "QuotaExceededError" && attempt < 3) {
            continue; // retry after eviction
          }
          StreamingLogger.push({
            category: "BUFFER",
            message: `appendBuffer error: ${(err as Error).message}`,
            isError: true,
          });
          console.error("[BufferManager] appendBuffer error:", err);
          break;
        }
      }
      resolve();
      if (this.seekAbort) break;
      await this.evictBackBuffer();
      this.checkForwardBuffer();
      this.afterAppendCb?.();
    }
    this.isAppending = false;

    if (this.streamDone && !this.seekAbort) {
      this.endStream();
    }
  }

  private waitForUpdateEnd(): Promise<void> {
    const sb = this.sourceBuffer;
    if (!sb || !sb.updating) return Promise.resolve();
    return new Promise((resolve) => {
      sb.addEventListener("updateend", () => resolve(), { once: true });
    });
  }

  /**
   * Returns the video element to use as the playback position reference.
   * In background mode (offscreenVideoEl is set), currentTime is always 0
   * so eviction naturally skips (nothing is "behind" position 0) and
   * back-pressure is based on total buffered duration rather than ahead-of-
   * playhead duration — which is the correct behaviour for a silent buffer.
   */
  private get timeRef(): HTMLVideoElement {
    return this.offscreenVideoEl ?? this.videoEl;
  }

  /**
   * Call after the background buffer has been promoted to the foreground video
   * element. Clears the offscreen element reference so that eviction and
   * back-pressure checks switch to using the real video's currentTime.
   */
  promoteToForeground(): void {
    if (this.offscreenVideoEl) {
      this.offscreenVideoEl.src = "";
      this.offscreenVideoEl = null;
    }
  }

  private async evictBackBuffer(): Promise<void> {
    const sb = this.sourceBuffer;
    if (!sb || sb.buffered.length === 0) return;

    const evictEnd = this.timeRef.currentTime - BACK_BUFFER_KEEP_S;
    const bufStart = sb.buffered.start(0);

    if (bufStart < evictEnd) {
      await this.waitForUpdateEnd();
      sb.remove(bufStart, evictEnd);
      await this.waitForUpdateEnd();
      StreamingLogger.push({
        category: "BUFFER",
        message: `Evicted [${bufStart.toFixed(1)}s, ${evictEnd.toFixed(1)}s)`,
        isError: false,
      });
    }
  }

  private handleTimeUpdate = (): void => {
    this.checkForwardBuffer();
  };

  private checkForwardBuffer(): void {
    const sb = this.sourceBuffer;
    if (!sb || sb.buffered.length === 0) return;

    const bufferedAhead = sb.buffered.end(sb.buffered.length - 1) - this.timeRef.currentTime;

    if (bufferedAhead > this.forwardTarget && !this.streamPaused) {
      this.streamPaused = true;
      StreamingLogger.push({
        category: "BUFFER",
        message: `Forward buffer ${bufferedAhead.toFixed(1)}s — pausing`,
        isError: false,
      });
      this.onPause();
    } else if (bufferedAhead < this.forwardResume && this.streamPaused) {
      this.streamPaused = false;
      StreamingLogger.push({
        category: "BUFFER",
        message: `Forward buffer ${bufferedAhead.toFixed(1)}s — resuming`,
        isError: false,
      });
      this.onResume();
    }
  }

  /**
   * Initialises a background MediaSource (not attached to videoEl) so segments
   * can be buffered before the switch. Returns the ObjectURL to assign to
   * videoEl.src when the buffer is ready for swap.
   */
  initBackground(mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ms = new MediaSource();
      this.mediaSource = ms;
      // Attach to an offscreen element — sourceopen only fires when the
      // MediaSource is connected to a media element. Store it on the instance
      // so it can't be garbage-collected (which would detach the MediaSource
      // and silently break buffering).
      const tmp = document.createElement("video");
      this.offscreenVideoEl = tmp;
      this.objectUrl = URL.createObjectURL(ms);
      tmp.src = this.objectUrl;

      ms.addEventListener(
        "sourceopen",
        () => {
          try {
            this.sourceBuffer = ms.addSourceBuffer(mimeType);
            this.sourceBuffer.mode = "sequence";
            if (this.videoDurationS > 0) {
              ms.duration = this.videoDurationS;
            }
            StreamingLogger.push({
              category: "BUFFER",
              message: "Background MSE open — sourceBuffer added (mode=sequence)",
              isError: false,
            });
            resolve(this.objectUrl as string);
          } catch (err) {
            StreamingLogger.push({
              category: "BUFFER",
              message: `Background addSourceBuffer failed: ${(err as Error).message}`,
              isError: true,
            });
            reject(err);
          }
        },
        { once: true }
      );
    });
  }

  markStreamDone(): void {
    this.streamDone = true;
    if (!this.isAppending) {
      this.endStream();
    }
  }

  private endStream(): void {
    if (this.mediaSource?.readyState === "open") {
      try {
        this.mediaSource.endOfStream();
        StreamingLogger.push({ category: "BUFFER", message: "endOfStream()", isError: false });
      } catch {
        // May already be closed
      }
    }
  }

  async seek(timeSeconds: number): Promise<void> {
    const sb = this.sourceBuffer;
    if (!sb) return;
    // Signal drainQueue to stop at its next checkpoint and drain the queue
    // immediately so drainQueue exits its while loop rather than picking up
    // more items while we wait for the SourceBuffer to finish its current op.
    this.seekAbort = true;
    for (const item of this.appendQueue) item.resolve();
    this.appendQueue = [];
    this.afterAppendCb = null;
    // Wait for any in-progress appendBuffer/remove to complete before calling
    // sb.remove() — calling it while updating=true throws InvalidStateError.
    await this.waitForUpdateEnd();
    this.seekAbort = false;
    this.isAppending = false;
    this.streamDone = false;
    this.streamPaused = false;
    sb.remove(0, Infinity);
    await this.waitForUpdateEnd();
    // In sequence mode the UA auto-manages timestampOffset, advancing it to
    // maintain continuity across appends. After flushing, the offset still
    // reflects the end of the previous chunk, so new segments (whose ffmpeg
    // timestamps restart near 0 due to -ss input seek) would be placed at the
    // wrong position in the buffer's timeline. Reset it to the seek position so
    // segments from the incoming chunk land where videoEl.currentTime expects.
    if (sb.mode === "sequence") {
      sb.timestampOffset = timeSeconds;
    }
    this.videoEl.currentTime = timeSeconds;
    StreamingLogger.push({
      category: "BUFFER",
      message: `Seek flush → ${timeSeconds.toFixed(2)}s (timestampOffset reset to ${timeSeconds.toFixed(2)}s)`,
      isError: false,
    });
  }

  /**
   * Tears down the MediaSource and revokes the ObjectURL.
   * Pass `clearVideoEl = true` (default) to also clear videoEl.src — omit this
   * when tearing down a foreground buffer whose src has already been replaced by
   * the background buffer swap.
   */
  teardown(clearVideoEl = true): void {
    this.videoEl.removeEventListener("timeupdate", this.handleTimeUpdate);
    if (clearVideoEl) {
      this.videoEl.src = "";
    }
    // Clear the offscreen element before revoking the URL to avoid a brief
    // period where the element holds a reference to a revoked blob URL.
    if (this.offscreenVideoEl) {
      this.offscreenVideoEl.src = "";
      this.offscreenVideoEl = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.mediaSource = null;
    this.sourceBuffer = null;
    // Resolve any pending segment promises so callers don't hang after teardown.
    for (const item of this.appendQueue) item.resolve();
    this.appendQueue = [];
    this.afterAppendCb = null;
    this.isAppending = false;
    this.streamDone = false;
    this.streamPaused = false;
    this.seekAbort = false;
    StreamingLogger.push({
      category: "BUFFER",
      message: "Teardown — ObjectURL revoked",
      isError: false,
    });
  }
}
