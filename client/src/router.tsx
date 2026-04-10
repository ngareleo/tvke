import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";

const LibraryPage = lazy(() =>
  import("./pages/LibraryPage.js").then((m) => ({ default: m.LibraryPage }))
);
const PlayerPage = lazy(() =>
  import("./pages/PlayerPage.js").then((m) => ({ default: m.PlayerPage }))
);

function PageLoader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
      <Spinner size="xl" />
    </Box>
  );
}

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LibraryPage />
      </Suspense>
    ),
  },
  {
    path: "/play/:videoId",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PlayerPage />
      </Suspense>
    ),
  },
]);
