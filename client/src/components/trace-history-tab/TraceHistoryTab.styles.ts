import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useTraceHistoryStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  description: {
    fontSize: "12px",
    color: tokens.colorTextMuted,
    lineHeight: "1.6",
  },
  empty: {
    fontSize: "12px",
    color: tokens.colorTextFaint,
    fontStyle: "italic",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
  },
  th: {
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: tokens.colorTextFaint,
    paddingBottom: "8px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
  },
  td: {
    paddingTop: "10px",
    paddingBottom: "10px",
    borderBottom: `1px solid ${tokens.colorBorderSoft}`,
    color: tokens.colorTextMuted,
    verticalAlign: "middle",
  },
  tdTitle: {
    color: tokens.colorText,
    fontWeight: "500",
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  traceCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  traceCode: {
    fontFamily: tokens.fontMono,
    fontSize: "10px",
    color: tokens.colorTextMuted,
    maxWidth: "110px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyBtn: {
    flexShrink: "0",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: "600",
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorTextMuted,
    cursor: "pointer",
    transitionProperty: "color, border-color",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorText,
      border: `1px solid ${tokens.colorTextMuted}`,
    },
  },
  copyBtnDone: {
    color: tokens.colorGreen,
    border: `1px solid ${tokens.colorGreen}`,
    ":hover": {
      color: tokens.colorGreen,
      border: `1px solid ${tokens.colorGreen}`,
    },
  },
});
