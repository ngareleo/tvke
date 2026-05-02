import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens";

export const useVideoPlayerStyles = makeStyles({
  // ── Container ──────────────────────────────────────────────────────────────
  // Transparent so VideoArea's backdrop poster shows through before playback.
  // Once the <video> element receives frames it paints its own pixels.
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  // ── Video element ──────────────────────────────────────────────────────────
  video: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
    backgroundColor: "transparent",
  },

  // ── Idle overlay (pre-play) ────────────────────────────────────────────────
  idleOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    rowGap: "14px",
    cursor: "pointer",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  // Glass 88×88 lab-style play disc (iOS-26 Liquid Glass inspired):
  // translucent white bg, backdrop blur + saturate, beveled borders
  // (top brighter, bottom darker), layered inset highlights + drop shadow.
  playBtn: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderTopWidth: "1px",
    borderRightWidth: "1px",
    borderBottomWidth: "1px",
    borderLeftWidth: "1px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: "rgba(255,255,255,0.30)",
    borderRightColor: "rgba(255,255,255,0.18)",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderLeftColor: "rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.5)",
    transitionProperty: "transform, background-color",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease",
    "& svg": {
      width: "40px",
      height: "40px",
      display: "block",
      filter:
        "drop-shadow(0 1px 0.5px rgba(255,255,255,0.45)) drop-shadow(0 -1px 0.5px rgba(0,0,0,0.55))",
    },
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.18)",
      transform: "scale(1.04)",
    },
    ":active": {
      transform: "scale(0.96)",
    },
  },

  // ── Loading overlay ────────────────────────────────────────────────────────
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  // 56×56 green-arc spinner per lab spec.
  loadingSpinner: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    borderTopWidth: "3px",
    borderRightWidth: "3px",
    borderBottomWidth: "3px",
    borderLeftWidth: "3px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: tokens.colorGreen,
    borderRightColor: "rgba(255,255,255,0.30)",
    borderBottomColor: "rgba(255,255,255,0.30)",
    borderLeftColor: "rgba(255,255,255,0.30)",
    animationName: { to: { transform: "rotate(360deg)" } },
    animationDuration: "0.9s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },

  // ── Transcode progress label ───────────────────────────────────────────────
  progressLabel: {
    position: "absolute",
    top: "16px",
    left: "16px",
    right: "16px",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "12px",
    paddingRight: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#aaa",
    fontFamily: tokens.fontMono,
    zIndex: 6,
  },

  // ── Error overlay ──────────────────────────────────────────────────────────
  errorOverlay: {
    position: "absolute",
    top: "16px",
    left: "16px",
    right: "16px",
    backgroundColor: "rgba(206,17,38,0.85)",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "14px",
    paddingRight: "14px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#fff",
    zIndex: 6,
  },

  // ── Control bar spinner (loading state inside ControlBar) ──────────────────
  ctrlSpinner: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    borderTopWidth: "2px",
    borderRightWidth: "2px",
    borderBottomWidth: "2px",
    borderLeftWidth: "2px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: "#fff",
    borderRightColor: "rgba(255,255,255,0.2)",
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderLeftColor: "rgba(255,255,255,0.2)",
    animationName: { to: { transform: "rotate(360deg)" } },
    animationDuration: "0.75s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});
