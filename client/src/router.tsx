import { createBrowserRouter } from "react-router-dom";
import { LibraryPage } from "./pages/LibraryPage.js";
import { PlayerPage } from "./pages/PlayerPage.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LibraryPage />,
  },
  {
    path: "/play/:videoId",
    element: <PlayerPage />,
  },
]);
