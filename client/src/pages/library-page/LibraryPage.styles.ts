import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useLibraryStyles = makeStyles({
  // ── Page layout ────────────────────────────────────────────────────────────
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  splitBody: {
    display: "grid",
    gridTemplateColumns: "1fr 0px 0px",
    flex: "1",
    minHeight: "0",
    transitionProperty: "grid-template-columns",
    transitionDuration: "0.25s",
    transitionTimingFunction: "ease",
    overflow: "hidden",
  },
  resizeHandle: {
    width: "4px",
    cursor: "col-resize",
    backgroundColor: tokens.colorBorder,
    transitionProperty: "background-color",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorRed,
    },
  },
  splitLeft: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: "0",
    minWidth: "0",
  },
  rightPane: {
    borderLeft: `1px solid ${tokens.colorBorder}`,
    backgroundColor: tokens.colorSurface,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: "0",
    minHeight: "0",
  },

  // ── Filter bar ─────────────────────────────────────────────────────────────
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 20px",
    height: "48px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
  },
  searchInput: {
    flex: "1",
    maxWidth: "300px",
    padding: "6px 12px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    ":focus": {
      border: `1px solid ${tokens.colorRed}`,
    },
    "::placeholder": {
      color: tokens.colorMuted2,
    },
  },
  filterSep: {
    width: "1px",
    height: "16px",
    backgroundColor: tokens.colorBorder,
    flexShrink: "0",
  },
  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "28px",
    background: "transparent",
    border: `1px solid transparent`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorMuted,
    cursor: "pointer",
    transitionProperty: "color, border-color, background",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
      backgroundColor: tokens.colorSurface2,
    },
  },
  toggleBtnActive: {
    color: tokens.colorWhite,
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
  },
  filterCount: {
    marginLeft: "auto",
    fontSize: "11px",
    color: tokens.colorMuted2,
  },

  // ── Library tabs ───────────────────────────────────────────────────────────
  tabs: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    overflowX: "auto",
    backgroundColor: tokens.colorSurface,
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 16px",
    height: "36px",
    fontSize: "12px",
    fontWeight: "600",
    color: tokens.colorMuted,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    transitionProperty: "color, border-color",
    transitionDuration: tokens.transition,
    whiteSpace: "nowrap",
    ":hover": {
      color: tokens.colorWhite,
    },
  },
  tabActive: {
    color: tokens.colorWhite,
    borderBottom: `2px solid ${tokens.colorRed}`,
  },
  tabCount: {
    fontSize: "10px",
    color: tokens.colorMuted2,
    fontWeight: "400",
  },

  // ── Grid ───────────────────────────────────────────────────────────────────
  gridArea: {
    flex: "1",
    overflowY: "auto",
    padding: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
  },

  // ── Profile chips ──────────────────────────────────────────────────────────
  profileChips: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    padding: "10px 20px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    fontWeight: "500",
    color: tokens.colorMuted,
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: "100px",
    cursor: "pointer",
    transitionProperty: "color, background, border-color",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
      border: `1px solid ${tokens.colorBorder2}`,
    },
  },
  chipActive: {
    color: tokens.colorWhite,
    backgroundColor: "rgba(206,17,38,0.12)",
    border: `1px solid rgba(206,17,38,0.4)`,
  },
  chipCount: {
    fontSize: "10px",
    color: tokens.colorMuted2,
    fontWeight: "400",
  },

  // ── Type filter select ─────────────────────────────────────────────────────
  filterSelect: {
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    padding: "6px 10px",
    borderRadius: tokens.radiusSm,
    outlineStyle: "none",
    cursor: "pointer",
    ":focus": {
      border: `1px solid ${tokens.colorRed}`,
    },
  },

  // ── List view ──────────────────────────────────────────────────────────────
  listArea: {
    flex: "1",
    overflowY: "auto",
    padding: "0 10px",
  },
  listHeader: {
    display: "grid",
    gridTemplateColumns: "48px 1fr 110px 60px 72px 64px",
    gap: "0 12px",
    alignItems: "center",
    padding: "0 10px 8px 10px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    marginBottom: "2px",
  },
  listHeaderCell: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: tokens.colorMuted2,
  },
  listRow: {
    display: "grid",
    gridTemplateColumns: "48px 1fr 110px 60px 72px 64px",
    gap: "0 12px",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: tokens.radiusSm,
    cursor: "pointer",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    borderBottom: "1px solid transparent",
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.04)",
    },
  },
  listRowSelected: {
    backgroundColor: "rgba(206,17,38,0.07)",
    borderBottomColor: "rgba(206,17,38,0.15)",
  },
  listThumb: {
    width: "48px",
    height: "68px",
    borderRadius: "3px",
    flexShrink: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: tokens.colorSurface2,
  },
  listInfo: {
    minWidth: "0",
  },
  listTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "rgba(245,245,245,0.85)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  listMeta: {
    fontSize: "11px",
    color: tokens.colorMuted,
    marginTop: "2px",
  },
  listCell: {
    fontSize: "11px",
    color: tokens.colorMuted2,
    whiteSpace: "nowrap",
    textAlign: "right",
  },

  // ── Empty states ───────────────────────────────────────────────────────────
  empty: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: tokens.colorMuted,
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: tokens.colorWhite,
  },
  emptyBody: {
    fontSize: "13px",
    textAlign: "center",
    maxWidth: "260px",
    lineHeight: "1.6",
  },
});
