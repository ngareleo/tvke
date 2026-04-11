import React, { type FC, Suspense } from "react";

import { LibraryPageContent } from "./LibraryPageContent.js";

export const LibraryPage: FC = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#666",
          }}
        >
          Loading…
        </div>
      }
    >
      <LibraryPageContent />
    </Suspense>
  );
};
