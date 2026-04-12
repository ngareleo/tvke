import { type FC } from "react";
import { useNavigation } from "react-router-dom";

import { usePageLoading } from "~/components/loading-bar/LoadingBarContext.js";

/**
 * Renders nothing but bridges React Router's navigation state into the
 * LoadingBar. Mount once inside LoadingBarProvider (AppShell does this).
 * Route transitions automatically show the loading bar without any
 * per-page usePageLoading() calls.
 */
export const RouterNavigationLoader: FC = () => {
  const { state } = useNavigation();
  usePageLoading(state === "loading");
  return null;
};
