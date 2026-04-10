import type { StorybookConfig } from "storybook-react-rsbuild";
import { pluginBabel } from "@rsbuild/plugin-babel";

import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    // @imchhh/storybook-addon-relay is NOT listed here — it ships CJS-only and
    // is re-implemented in ESM at src/storybook/withRelay.tsx.
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-onboarding"),
  ],
  framework: {
    name: getAbsolutePath("storybook-react-rsbuild"),
    options: {},
  },
  rsbuildFinal(config) {
    // Apply babel-plugin-relay so graphql template literals in story and
    // component files are transformed at build time.
    config.plugins ??= [];
    config.plugins.push(
      pluginBabel({
        babelLoaderOptions: {
          plugins: ["relay"],
        },
      })
    );
    return config;
  },
};

export default config;
