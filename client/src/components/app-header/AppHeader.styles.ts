import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useAppHeaderStyles = makeStyles({
  root: {
    gridArea: "header",
    display: "flex",
    alignItems: "stretch",
    position: "sticky",
    top: "0",
    zIndex: 100,
    background: `linear-gradient(
      160deg,
      rgba(235, 45, 60, 0.30) 0%,
      rgba(190, 12, 28, 0.42) 45%,
      rgba(130, 5, 18, 0.52) 100%
    )`,
    backdropFilter: "blur(28px) saturate(2.8) brightness(0.72)",
    WebkitBackdropFilter: "blur(28px) saturate(2.8) brightness(0.72)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 160, 150, 0.22), inset 0 -1px 0 rgba(206, 17, 38, 0.30), 0 2px 16px rgba(0, 0, 0, 0.45)",
    borderBottom: `1px solid ${tokens.colorRedBorder}`,
  },

  brand: {
    width: tokens.sidebarWidth,
    display: "flex",
    alignItems: "center",
    gap: tokens.space2,
    paddingLeft: tokens.space4,
    paddingRight: tokens.space4,
    overflow: "hidden",
    flexShrink: 0,
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(206, 17, 38, 0.20)",
    transitionProperty: "width",
    transitionDuration: "0.22s",
    transitionTimingFunction: "ease",
  },
  brandText: {
    overflow: "hidden",
  },
  logoMark: {
    fontFamily: tokens.fontHead,
    fontSize: "21px",
    letterSpacing: "0.12em",
    color: tokens.colorWhite,
    lineHeight: "1",
  },
  logoSub: {
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: tokens.colorRed,
    display: "block",
    marginTop: "1px",
  },
  brandTextHidden: {
    display: "none",
  },

  content: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    paddingLeft: "20px",
    paddingRight: "20px",
    gap: "12px",
    minWidth: "0",
  },
});
