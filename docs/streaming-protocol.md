# Streaming Protocol

## Overview

Video is delivered over a single HTTP GET request using chunked transfer encoding. The body is a continuous binary stream of length-prefixed fMP4 segments. The client uses the browser's Media Source Extensions (MSE) API to decode and render frames as segments arrive.

This is not HLS, DASH, or any standard protocol — it is a minimal custom binary framing protocol designed for simplicity and low overhead.

---

## Why fMP4?

The MSE `SourceBuffer.appendBuffer()` method requires **fragmented MP4** (fMP4). A standard MP4 file stores its index (`moov` box) at the end of the file, which means the browser must receive the entire file before it can begin decoding. fMP4 stores a small init segment up front and then streams self-contained media fragments (`moof` + `mdat` boxes) in sequence.

Codec: **H.264 (AVC) + AAC**, encoded with:
- `-movflags frag_keyframe+empty_moov+default_base_moof` (ffmpeg flags that produce valid fMP4)
- `-g 48 -keyint_min 48 -sc_threshold 0` (forces a keyframe at least every 2s at 24fps, enabling clean segment boundaries)

---

## Wire Format

```
┌────────────────────────────────────────────────────────────┐
│ Frame 1: Init Segment                                      │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ uint32 BE: N     │  │ N bytes: fMP4 init segment   │   │
│  │ (4 bytes)        │  │ (moov box — codec metadata)  │   │
│  └──────────────────┘  └──────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ Frame 2: Media Segment 0                                   │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ uint32 BE: M     │  │ M bytes: segment_0000.m4s    │   │
│  └──────────────────┘  └──────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ Frame 3: Media Segment 1                                   │
│  ...                                                       │
└────────────────────────────────────────────────────────────┘
```

- All length values are **unsigned 32-bit integers in big-endian byte order**
- The first frame is **always** the init segment — no exceptions
- Frames arrive in ascending segment index order
- The stream ends when the HTTP response body closes

---

## Init Segment Requirement

The init segment must be the **first** data appended to the MSE `SourceBuffer`. It contains the `moov` box, which tells the browser:
- Which codecs are in use (H.264 profile/level, AAC variant)
- The track layout (video resolution, audio channels, sample rates)
- Timing metadata

If any media segment is appended before the init segment, `appendBuffer()` fires an error event and the `SourceBuffer` enters an unrecoverable error state. The entire MSE pipeline must be torn down and re-initialized.

The server generates the init segment by running a zero-duration ffmpeg pass on the first `.m4s` output file.

---

## Server Streaming Logic

`server/src/routes/stream.ts`:

1. Wait for `job.initSegmentPath` to be set (polling 100ms, max 10s)
2. Read init segment bytes from disk → write `[4-byte length][bytes]` to response
3. Loop:
   - If `index < job.segments.length` and segment file exists → read → write frame → increment index
   - Else if `job.status === 'complete'` → break
   - Else if `job.status === 'error'` → break
   - Else → `await sleep(100)` and retry
4. Close response

The `?from=N` query parameter skips directly to segment index N (used for seeking). The init segment is always sent regardless of `from`.

---

## Client Parsing Logic

`client/src/services/StreamingService.ts`:

```
fetch('/stream/<jobId>')
  └─ response.body.getReader()
       └─ loop: reader.read() → Uint8Array chunks
            └─ concat into accumulator buffer
                 └─ while buffer.length >= 4:
                      read uint32 BE → segLen
                      if buffer.length >= 4 + segLen:
                        extract buffer[4 .. 4+segLen] as ArrayBuffer
                        call onSegment(data, isInit)
                        advance buffer by 4 + segLen
```

The accumulator handles TCP fragmentation — a single `reader.read()` call may return a partial segment, multiple segments, or any combination.

---

## MSE Constraints

The MSE `SourceBuffer` has strict rules:

| Rule | Consequence of violation |
|---|---|
| Init segment must be first | `appendBuffer` fires error event, SourceBuffer enters error state |
| `appendBuffer` while `updating === true` | Throws `InvalidStateError` synchronously |
| `MediaSource.endOfStream()` not called | `<video>` stalls indefinitely waiting for more data |
| Object URL not revoked | Memory leak — the MediaSource stays alive |

`BufferManager` handles all of these: it serializes appends through a queue, calls `endOfStream()` when done, and revokes the URL in `teardown()`.

---

## Seeking Protocol

1. Client determines target segment index: `Math.floor(seekTime / segmentDuration)`
2. `StreamingService.cancel()` — aborts the current fetch
3. `BufferManager.seek(seekTime)`:
   - `await waitForUpdateEnd()`
   - `sourceBuffer.remove(0, Infinity)` — clear all buffered content
   - `await waitForUpdateEnd()`
   - Reset append queue and flags
   - Set `video.currentTime = seekTime`
4. `StreamingService.start(jobId, segmentIndex, ...)` — new fetch with `?from=<index>`
5. Server streams init segment + media segments starting from index

**Note:** Seeking accuracy depends on segment boundary alignment. With 2-second segments and forced keyframes every 2s, seek precision is ±2s at worst.

---

## Back-Pressure

The client pauses fetching when the forward buffer exceeds 20 seconds to avoid unbounded memory growth:

```
after each appendBuffer:
  bufferedAhead = sourceBuffer.buffered.end(last) - video.currentTime
  if bufferedAhead > 20s → StreamingService.pause()
  if bufferedAhead < 15s → StreamingService.resume()
```

Back buffer eviction keeps at most 5 seconds behind `currentTime`:

```
after each appendBuffer:
  evictEnd = video.currentTime - 5s
  if sourceBuffer.buffered.start(0) < evictEnd:
    sourceBuffer.remove(buffered.start(0), evictEnd)
```

At 4K (15 Mbps), 25 seconds of buffer is approximately **46 MB** — acceptable for a desktop browser.
