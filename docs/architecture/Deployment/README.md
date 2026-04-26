# Deployment

How xstream ships to users. Current: local dev only. Future: Tauri desktop bundle driven by a Rust server rewrite.

| File | Hook |
|---|---|
| [`00-Rust-Tauri-Port.md`](00-Rust-Tauri-Port.md) | Rewrite plan: stable contracts (SDL, global IDs, binary framing), bundleable-everything rule, ffmpeg as bundled subprocess. |
| [`01-Streaming-Layer.md`](01-Streaming-Layer.md) | Stream endpoint + chunker migration — pull contract → axum, MAX_CONCURRENT_JOBS → Semaphore, content-addressed cache key for future peer-sharing. |
