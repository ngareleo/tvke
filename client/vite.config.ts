import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: ["relay"],
      },
    }),
    // Generate stats.html whenever we're building (not serving).
    // In CI the artifact is uploaded; locally open dist/stats.html to inspect.
    command === "build" &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ],
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
