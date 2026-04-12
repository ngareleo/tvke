import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useLibraryListHeaderStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "48px 1fr 110px 60px 72px 64px",
    gap: "0 12px",
    alignItems: "center",
    padding: "0 10px 8px 10px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    marginBottom: "2px",
  },
  cell: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: tokens.colorMuted2,
  },
});
