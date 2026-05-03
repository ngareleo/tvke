import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useFlagsTabStyles = makeStyles({
  categoryBlock: {
    marginBottom: "28px",
  },
  categoryHeader: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorTextFaint,
    marginBottom: "10px",
    paddingBottom: "4px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
  },
  flagRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "10px 0",
    borderBottom: `1px solid ${tokens.colorBorderSoft}`,
    ":last-child": {
      borderBottom: "0px solid transparent",
    },
  },
  flagMeta: {
    flex: "1 1 auto",
    minWidth: "0",
  },
  flagName: {
    fontSize: "13px",
    fontWeight: "600",
    color: tokens.colorText,
    marginBottom: "2px",
  },
  flagDesc: {
    fontSize: "11px",
    color: tokens.colorTextMuted,
    lineHeight: "1.5",
  },
  defaultHint: {
    fontSize: "10px",
    color: tokens.colorTextFaint,
    marginLeft: "6px",
    fontWeight: "400",
    letterSpacing: "0.04em",
  },
  flagControl: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
  },
  numberInput: {
    width: "80px",
    padding: "6px 8px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorText,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    textAlign: "right",
    ":focus": {
      border: `1px solid ${tokens.colorGreen}`,
    },
    boxSizing: "border-box",
  },
  actionsBlock: {
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: `1px solid ${tokens.colorBorder}`,
  },
  actionsHeader: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorTextFaint,
    marginBottom: "6px",
  },
  actionsDesc: {
    fontSize: "11px",
    color: tokens.colorTextMuted,
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  actionRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "10px 0",
  },
  actionLabel: {
    flex: "1 1 auto",
    minWidth: "0",
  },
  actionName: {
    fontSize: "13px",
    fontWeight: "600",
    color: tokens.colorText,
    marginBottom: "2px",
  },
  actionHint: {
    fontSize: "11px",
    color: tokens.colorTextMuted,
    lineHeight: "1.5",
  },
  actionButton: {
    flex: "0 0 auto",
    padding: "6px 14px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorText,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    fontWeight: "600",
    cursor: "pointer",
    transitionProperty: "background-color, border-color, color",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorGreenSoft,
      border: `1px solid ${tokens.colorGreen}`,
      color: tokens.colorGreen,
    },
  },
});
