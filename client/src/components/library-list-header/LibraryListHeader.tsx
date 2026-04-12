import { type FC } from "react";

import { strings } from "./LibraryListHeader.strings.js";
import { useLibraryListHeaderStyles } from "./LibraryListHeader.styles.js";

export const LibraryListHeader: FC = () => {
  const styles = useLibraryListHeaderStyles();
  return (
    <div className={styles.root}>
      <div />
      <div className={styles.cell}>{strings.colTitle}</div>
      <div className={styles.cell} style={{ textAlign: "right" }}>
        {strings.colFormat}
      </div>
      <div className={styles.cell} style={{ textAlign: "right" }}>
        {strings.colRating}
      </div>
      <div className={styles.cell} style={{ textAlign: "right" }}>
        {strings.colDuration}
      </div>
      <div className={styles.cell} style={{ textAlign: "right" }}>
        {strings.colSize}
      </div>
    </div>
  );
};
