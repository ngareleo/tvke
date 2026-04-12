import { type LazyExoticComponent } from "react";

import { lazyNamedExport } from "~/utils/lazy.js";

import type { SignOutDialog as SignOutDialogType } from "./SignOutDialog.js";

export const SignOutDialogAsync: LazyExoticComponent<typeof SignOutDialogType> = lazyNamedExport(
  () => import("./SignOutDialog.js"),
  (m) => m.SignOutDialog
);
