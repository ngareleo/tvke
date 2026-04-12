import type { LazyExoticComponent } from "react";

import { lazyNamedExport } from "~/utils/lazy.js";

import type { Sidebar as SidebarType } from "./Sidebar.js";

export const SidebarAsync: LazyExoticComponent<typeof SidebarType> = lazyNamedExport(
  () => import(/* webpackChunkName: "Sidebar" */ "./Sidebar.js"),
  (m) => m.Sidebar
);
