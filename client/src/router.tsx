import React, { type FC, lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";

import { AppShell } from "~/components/app-shell/AppShell.js";

const DashboardPage = lazy(() => import("./pages/DashboardPage.js"));
const LibraryPage = lazy(() =>
  import("./pages/LibraryPage.js").then((m) => ({ default: m.LibraryPage }))
);
const WatchlistPage = lazy(() => import("./pages/WatchlistPage.js"));
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage }))
);
const FeedbackPage = lazy(() =>
  import("./pages/FeedbackPage.js").then((m) => ({ default: m.FeedbackPage }))
);
const PlayerPage = lazy(() =>
  import("./pages/PlayerPage.js").then((m) => ({ default: m.PlayerPage }))
);

function PageLoader(): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "#444",
        fontSize: 13,
      }}
    />
  );
}

const ShellLayout: FC = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: <ShellLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/library",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LibraryPage />
          </Suspense>
        ),
      },
      {
        path: "/watchlist",
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatchlistPage />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "/feedback",
        element: (
          <Suspense fallback={<PageLoader />}>
            <FeedbackPage />
          </Suspense>
        ),
      },
    ],
  },
  // Player is full-screen — no AppShell
  {
    path: "/play/:videoId",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PlayerPage />
      </Suspense>
    ),
  },
  {
    path: "/player/:videoId",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PlayerPage />
      </Suspense>
    ),
  },
]);
