/**
 * DevPanelAsync — lazy-loaded wrapper around DevPanelInner.
 *
 * In development: DevPanelInner is dynamically imported into its own chunk so
 * it is not part of the initial bundle. The chunk is only fetched when the
 * component first renders.
 *
 * In production: the conditional is statically replaced by the bundler
 * (process.env.NODE_ENV → "production"), the dynamic import is dead code, and
 * tree-shaking removes it entirely. Nothing from DevPanel ships to users.
 */

import { type FC, type LazyExoticComponent, Suspense } from "react";

import { lazyNamedExport } from "~/utils/lazy.js";

import type { DevPanelInner as DevPanelInnerType } from "./DevPanel.js";

const Inner: LazyExoticComponent<typeof DevPanelInnerType> = lazyNamedExport(
  () => import(/* webpackChunkName: "DevPanel" */ "./DevPanel.js"),
  (m) => m.DevPanelInner
);

const DevPanelLazy: FC = () => (
  <Suspense fallback={null}>
    <Inner />
  </Suspense>
);

const Noop: FC = () => null;

export const DevPanelAsync: FC = process.env.NODE_ENV !== "production" ? DevPanelLazy : Noop;
