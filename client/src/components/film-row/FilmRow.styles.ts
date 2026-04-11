import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useFilmRowStyles = makeStyles({
  row: {
    display: "grid",
    gridTemplateColumns:
      "28px 1fr minmax(60px,80px) minmax(80px,1fr) minmax(50px,70px) minmax(80px,110px)",
    alignItems: "center",
    padding: "0 24px 0 44px",
    height: "38px",
    borderBottom: `1px solid rgba(255,255,255,0.025)`,
    backgroundColor: "rgba(0,0,0,0.18)",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    cursor: "pointer",
    position: "relative",
    ":hover": {
      backgroundColor: "rgba(206,17,38,0.04)",
    },
  },
  rowSelected: {
    backgroundColor: "rgba(206,17,38,0.07)",
    borderLeft: `2px solid ${tokens.colorRed}`,
    paddingLeft: "42px",
  },
  rowUnmatched: {
    // Handled by child icon/name colors below
  },

  // Tree line connector — rendered as a real child element
  treeLineEl: {
    position: "absolute",
    left: "37px",
    top: "0",
    bottom: "0",
    width: "1px",
    background: "rgba(255,255,255,0.06)",
    pointerEvents: "none",
  },

  icon: {
    display: "flex",
    alignItems: "center",
    color: tokens.colorMuted2,
    flexShrink: "0",
  },

  nameCell: {
    minWidth: "0",
    paddingRight: "12px",
  },
  name: {
    fontSize: "12px",
    fontWeight: "500",
    color: "rgba(245,245,245,0.8)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  nameUnmatched: {
    color: tokens.colorYellow,
  },
  filename: {
    fontSize: "10px",
    color: tokens.colorMuted2,
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "1px",
  },

  cell: {
    fontSize: "11px",
    color: tokens.colorMuted2,
    whiteSpace: "nowrap",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    opacity: "0",
    transitionProperty: "opacity",
    transitionDuration: tokens.transition,
  },
  actionsVisible: {
    opacity: "1",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    padding: "1px 5px",
    borderRadius: "3px",
  },
  badgeRed: {
    backgroundColor: tokens.colorRedDim,
    border: `1px solid ${tokens.colorRedBorder}`,
    color: "rgba(206,17,38,0.9)",
  },
  badgeGray: {
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    color: tokens.colorMuted,
  },

  // Tiny surface button
  btnSurface: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 7px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorMuted,
    cursor: "pointer",
    transitionProperty: "color, border-color",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
      border: `1px solid ${tokens.colorBorder2}`,
    },
  },
  btnRed: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    backgroundColor: tokens.colorRed,
    border: `1px solid ${tokens.colorRed}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    cursor: "pointer",
    textDecoration: "none",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorRedDark,
    },
  },
  btnYellow: {
    color: tokens.colorYellow,
    border: `1px solid rgba(245,197,24,0.2)`,
  },
});
