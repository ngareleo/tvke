import { type FC, Suspense } from "react";

import { LibraryPageContent } from "./LibraryPageContent.js";

const LibraryPage: FC = () => (
  <Suspense fallback={null}>
    <LibraryPageContent />
  </Suspense>
);

export default LibraryPage;
