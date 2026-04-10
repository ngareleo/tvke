import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * Split vendor dependencies into stable, independently-cacheable chunks.
 * Grouping by library means a UI-only change doesn't bust the relay or
 * react cache, and vice versa.
 */
function manualChunks(id: string): string | undefined {
  // Chakra UI pulls in @emotion, @ark-ui, and @zag-js — group them all
  // together since they're always co-loaded and change together.
  if (/@chakra-ui|@emotion|@ark-ui|@zag-js/.test(id)) return "vendor-chakra";

  // Relay + GraphQL are tightly coupled; bundle them as one cacheable unit.
  if (/relay-runtime|react-relay|[/+]graphql[/+]/.test(id)) return "vendor-relay";

  // React core + DOM + scheduler.
  if (/[/+]react@|[/+]react-dom@|\/scheduler\//.test(id)) return "vendor-react";
}

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: ["relay"],
      },
    }),
    // Generate stats.html on every build.
    // In CI the artifact is uploaded; locally open dist/stats.html to inspect.
    command === "build" &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ],
  build: {
    // Terser produces ~5-8% smaller output than esbuild at the cost of a
    // slower build — acceptable for production, irrelevant in dev.
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/graphql": "http://localhost:3001",
      "/stream": "http://localhost:3001",
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
