import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useSettingsSelectorStyles = makeStyles({
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    paddingTop: "6px",
    paddingBottom: "6px",
    paddingLeft: "12px",
    paddingRight: "12px",
    backgroundColor: tokens.colorSurface2,
    borderTopWidth: "1px",
    borderRightWidth: "1px",
    borderBottomWidth: "1px",
    borderLeftWidth: "1px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: tokens.colorBorder,
    borderRightColor: tokens.colorBorder,
    borderBottomColor: tokens.colorBorder,
    borderLeftColor: tokens.colorBorder,
    borderRadius: tokens.radiusSm,
    fontFamily: tokens.fontMono,
    fontSize: "11px",
    color: tokens.colorText,
    letterSpacing: "0.08em",
    cursor: "pointer",
    transitionProperty: "border-color, background-color",
    transitionDuration: tokens.transition,
    ":hover:not(:disabled)": {
      borderTopColor: tokens.colorGreen,
      borderRightColor: tokens.colorGreen,
      borderBottomColor: tokens.colorGreen,
      borderLeftColor: tokens.colorGreen,
    },
    ":disabled": {
      cursor: "default",
    },
  },
  value: {
    flexGrow: 1,
    textAlign: "left",
  },
  chevron: {
    color: tokens.colorTextMuted,
  },
});
