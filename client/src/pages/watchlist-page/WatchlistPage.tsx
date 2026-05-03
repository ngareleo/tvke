import { type FC, Suspense } from "react";

import { WatchlistPageContent } from "./WatchlistPageContent.js";

const WatchlistPage: FC = () => (
  <Suspense fallback={null}>
    <WatchlistPageContent />
  </Suspense>
);

export default WatchlistPage;
