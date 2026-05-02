import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useSettingsToggleStyles = makeStyles({
  track: {
    width: "38px",
    height: "20px",
    borderRadius: tokens.radiusFull,
    position: "relative",
    cursor: "pointer",
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
    padding: "0",
    flexShrink: "0",
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.transition,
  },
  trackOn: {
    backgroundColor: tokens.colorGreen,
    borderTopColor: tokens.colorGreen,
    borderRightColor: tokens.colorGreen,
    borderBottomColor: tokens.colorGreen,
    borderLeftColor: tokens.colorGreen,
  },
  knob: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "14px",
    height: "14px",
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens.colorTextDim,
    transitionProperty: "left, background-color",
    transitionDuration: tokens.transition,
  },
  knobOn: {
    left: "20px",
    backgroundColor: tokens.colorGreenInk,
  },
  disabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
});
