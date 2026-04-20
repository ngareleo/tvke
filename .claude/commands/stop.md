# Stop

Kill the server, client dev server, and any running ffmpeg jobs.

```bash
bun run stop
```

Safe to run at any time — reports what it killed and exits 0 even if nothing was running. Sends `SIGTERM` to each process group; does not force-kill.

Processes stopped (in order):
1. Rsbuild / Vite dev server
2. Bun server (`src/index.ts`)
3. Any ffmpeg transcode jobs
