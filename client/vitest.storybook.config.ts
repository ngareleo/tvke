import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["relay"],
      },
    }),
  ],
  resolve: {
    alias: {
      // Mirror the ~ → src/ alias from rsbuild.config.ts so Vite resolves
      // ~/hooks/..., ~/components/... etc. in story browser tests.
      "~": path.resolve(dirname, "src"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: {
          name: "storybook",
          // Retry once on flaky module-fetch failures from the storybook
          // vitest deps server under CI (`Failed to fetch dynamically
          // imported module: .../sb-vitest/deps/react-18-...`). The
          // browser pool occasionally races the Vite dep optimiser; a
          // single retry resolves it without hiding real regressions
          // (any genuine failure reproduces twice).
          retry: 1,
          // Run story files one-at-a-time. The storybook vitest browser
          // mode shares a single Vite deps optimiser across concurrent
          // file workers; under CI (limited cores) two workers can race
          // to populate `sb-vitest/deps/react-18-…js` and one fetch
          // 404s. Local machines have enough headroom that the race
          // doesn't surface, which is why this only fails on Actions.
          // Tradeoff: ~10–20 % slower locally, deterministic on CI.
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" as const }],
          },
          setupFiles: [
            "@storybook/addon-vitest/internal/setup-file",
            ".storybook/vitest.setup.ts",
          ],
        },
      },
    ],
  },
});
