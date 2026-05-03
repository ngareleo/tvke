import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens";

export const usePagePlaceholderStyles = makeStyles({
  root: {
    paddingTop: `calc(${tokens.headerHeight} + 64px)`,
    paddingLeft: tokens.space5,
    paddingRight: tokens.space5,
    paddingBottom: tokens.space5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    boxSizing: "border-box",
    color: tokens.colorTextDim,
  },
  eyebrow: {
    fontFamily: tokens.fontMono,
    fontSize: "10px",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: tokens.colorTextFaint,
    marginBottom: tokens.space3,
  },
  title: {
    fontFamily: tokens.fontHead,
    fontSize: "48px",
    letterSpacing: "0.04em",
    color: tokens.colorText,
    marginBottom: tokens.space2,
  },
  body: {
    fontFamily: tokens.fontMono,
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: tokens.colorTextMuted,
  },
});
