# Deployment

How xstream gets packaged and delivered to end users — desktop shells, code signing, auto-update, and CI release pipelines.

This concept folder is **interim-focused**. The terminal-form deployment story for xstream is the Rust + Tauri rewrite ([`docs/migrations/rust-rewrite/`](../../migrations/rust-rewrite/), packaging in [`08-Tauri-Packaging.md`](../../migrations/rust-rewrite/08-Tauri-Packaging.md)). The docs here cover the **stop-gap question** of how to ship the current Bun-server + React-client architecture as a desktop app *before* the Rust port lands, so the product can be released and iterated on without rushing the rewrite.

| File | Hook |
|---|---|
| [`00-Interim-Desktop-Shell.md`](00-Interim-Desktop-Shell.md) | Compatibility analysis of the Bun + React architecture against three desktop-shell candidates (Electron, Tauri-with-Bun-sidecar, Electrobun). Caveats, OS distribution, updates, CI, and the invariants every interim shell must preserve. |
