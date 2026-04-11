import type { LazyExoticComponent } from "react";

import { lazyNamedExport } from "~/utils/lazy.js";

import type { VideoPlayer as VideoPlayerType } from "./VideoPlayer.js";

export const VideoPlayerAsync: LazyExoticComponent<typeof VideoPlayerType> = lazyNamedExport(
  () => import(/* webpackChunkName: "VideoPlayer" */ "./VideoPlayer.js"),
  (m) => m.VideoPlayer
);
