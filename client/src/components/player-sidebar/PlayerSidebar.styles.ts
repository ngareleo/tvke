import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const usePlayerSidebarStyles = makeStyles({
  root: {
    width: tokens.playerPanelWidth,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
    borderLeft: `1px solid ${tokens.colorBorder}`,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  // ── Section ────────────────────────────────────────────────────────────────
  section: {
    padding: "16px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
  },
  sectionLabel: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: tokens.colorMuted2,
    marginBottom: "12px",
  },

  // ── Now Playing poster ─────────────────────────────────────────────────────
  poster: {
    width: "100%",
    aspectRatio: "16/9",
    borderRadius: tokens.radiusMd,
    overflow: "hidden",
    marginBottom: "12px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: "linear-gradient(135deg, #1a0a0a 0%, #2d0d10 50%, #0f0f0f 100%)",
  },

  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: tokens.colorWhite,
    lineHeight: "1.3",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "11px",
    color: tokens.colorMuted,
    marginBottom: "10px",
  },
  plot: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: "1.7",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: "4",
    WebkitBoxOrient: "vertical",
  },

  // ── Up Next items ─────────────────────────────────────────────────────────
  upNextItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "7px 0",
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    ":last-child": {
      borderBottom: "none",
    },
  },
  upNextThumb: {
    width: "60px",
    height: "34px",
    borderRadius: "4px",
    flexShrink: "0",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: "linear-gradient(135deg, #1a0a0a 0%, #2d0d10 100%)",
    position: "relative",
    overflow: "hidden",
  },
  upNextInfo: {
    flex: "1",
    minWidth: "0",
  },
  upNextTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  upNextYear: {
    fontSize: "10px",
    color: tokens.colorMuted2,
    marginTop: "2px",
  },
  upNextPlay: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    backgroundColor: tokens.colorRed,
    border: "none",
    borderRadius: "50%",
    color: tokens.colorWhite,
    cursor: "pointer",
    flexShrink: "0",
    textDecoration: "none",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorRedDark,
    },
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    padding: "14px 16px",
    marginTop: "auto",
    borderTop: `1px solid ${tokens.colorBorder}`,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "transparent",
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorMuted,
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transitionProperty: "color, border-color",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
      border: `1px solid ${tokens.colorBorder2}`,
    },
  },
});
