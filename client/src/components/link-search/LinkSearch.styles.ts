import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens";

export const useLinkSearchStyles = makeStyles({
  root: { display: "flex", flexDirection: "column", flex: "1", overflow: "hidden" },

  fileRow: {
    padding: "12px 16px 10px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    backgroundColor: tokens.colorSurface2,
  },
  fileLabel: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorTextMuted,
    marginBottom: "3px",
  },
  fileName: {
    fontSize: "11px",
    color: tokens.colorTextDim,
    fontFamily: tokens.fontMono,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    backgroundColor: tokens.colorSurface,
  },
  searchIcon: { color: tokens.colorTextMuted, flexShrink: "0" },
  input: {
    flex: "1",
    background: "none",
    border: "none",
    outlineStyle: "none",
    fontSize: "13px",
    fontFamily: tokens.fontBody,
    color: tokens.colorText,
    minWidth: "0",
    "::placeholder": { color: tokens.colorTextMuted },
  },
  spinner: { color: tokens.colorTextMuted, flexShrink: "0" },
  clearBtn: {
    background: "none",
    border: "none",
    color: tokens.colorTextMuted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    borderRadius: "50%",
    flexShrink: "0",
    transitionProperty: "color, background",
    transitionDuration: tokens.transition,
    ":hover": { color: tokens.colorText, backgroundColor: "rgba(255,255,255,0.08)" },
  },

  suggestions: {
    flex: "1",
    overflowY: "auto",
    animationName: {
      from: { opacity: "0", transform: "translateY(-6px)" },
      to: { opacity: "1", transform: "translateY(0)" },
    },
    animationDuration: "0.15s",
    animationTimingFunction: "ease",
    animationFillMode: "both",
  },

  noResults: {
    padding: "12px 0",
    fontSize: "12px",
    color: tokens.colorTextMuted,
    textAlign: "center",
  },

  cancelBtn: {
    padding: "10px 16px",
    background: "none",
    border: "none",
    borderTop: `1px solid ${tokens.colorBorder}`,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    color: tokens.colorTextMuted,
    cursor: "pointer",
    textAlign: "left",
    marginTop: "auto",
    transitionProperty: "color, background",
    transitionDuration: tokens.transition,
    ":hover": { color: tokens.colorTextDim, backgroundColor: "rgba(255,255,255,0.03)" },
  },
});
