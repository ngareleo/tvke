import { makeStyles } from "@griffel/react";

export const usePlayerContentStyles = makeStyles({
  shell: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000",
    overflowX: "hidden",
    overflowY: "hidden",
    cursor: "default",
    outline: "none",
  },
  shellChromeHidden: {
    cursor: "none",
  },
  panelScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 18,
    backgroundColor: "transparent",
    cursor: "pointer",
  },
});
