import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useSettingsTabStyles = makeStyles({
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: tokens.colorText,
    marginBottom: "4px",
  },
  sectionDesc: {
    fontSize: "12px",
    color: tokens.colorTextMuted,
    lineHeight: "1.6",
    marginBottom: "14px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorTextFaint,
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorText,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    ":focus": {
      border: `1px solid ${tokens.colorGreen}`,
    },
    "::placeholder": {
      color: tokens.colorTextFaint,
    },
    boxSizing: "border-box",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: tokens.colorGreen,
    border: `1px solid ${tokens.colorGreen}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorGreenInk,
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    transitionProperty: "background-color, border-color, color",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorGreenDeep,
      border: `1px solid ${tokens.colorGreenDeep}`,
      color: tokens.colorText,
    },
    ":disabled": {
      opacity: "0.5",
      cursor: "default",
    },
  },
  successMsg: {
    fontSize: "11px",
    color: tokens.colorGreen,
    marginTop: "8px",
  },
  dangerZone: {
    border: `1px solid ${tokens.colorRed}`,
    borderRadius: tokens.radiusMd,
    padding: "16px",
    backgroundColor: "rgba(255, 93, 108, 0.04)",
  },
  dangerTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: tokens.colorRed,
    marginBottom: "8px",
  },
  dangerDesc: {
    fontSize: "11px",
    color: tokens.colorTextMuted,
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colorRed}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorRed,
    fontSize: "12px",
    fontWeight: "600",
    cursor: "not-allowed",
    opacity: "0.5",
  },
});
