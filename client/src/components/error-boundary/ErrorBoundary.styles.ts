import { makeStyles, shorthands } from "@griffel/react";

export const useErrorBoundaryStyles = makeStyles({
  // ── Shared ────────────────────────────────────────────────────────────────
  root: {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    background: "#0a0a0f",
    padding: "40px 16px",
  },

  grain: {
    position: "fixed",
    inset: "0",
    zIndex: "0",
    opacity: "0.2",
    pointerEvents: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
    backgroundSize: "200px 200px",
  },

  // ── Dev screen ────────────────────────────────────────────────────────────
  devRoot: {
    alignItems: "flex-start",
    background:
      "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(206,17,38,0.06) 0%, transparent 60%), #0a0a0f",
  },

  panel: {
    position: "relative",
    zIndex: "1",
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(206,17,38,0.3)",
    borderRadius: "8px",
    overflow: "hidden",
  },

  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 18px",
    background: "rgba(206,17,38,0.08)",
    borderBottom: "1px solid rgba(206,17,38,0.2)",
    flexWrap: "wrap",
  },

  headLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  iconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(206,17,38,0.15)",
    border: "1px solid rgba(206,17,38,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#CE1126",
    flexShrink: "0",
  },

  label: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#CE1126",
    marginBottom: "2px",
  },

  errorName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },

  headActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transitionProperty: "background, color",
    transitionDuration: "0.15s",
    transitionTimingFunction: "ease",
    letterSpacing: "0.02em",
    ":hover": {
      background: "rgba(255,255,255,0.09)",
      color: "#ffffff",
    },
  },

  actionPrimary: {
    background: "rgba(206,17,38,0.12)",
    color: "#CE1126",
    ...shorthands.borderColor("rgba(206,17,38,0.3)"),
    ":hover": {
      background: "rgba(206,17,38,0.2)",
      color: "#CE1126",
    },
  },

  actionPreview: {
    color: "rgba(245,197,24,0.7)",
    ...shorthands.borderColor("rgba(245,197,24,0.2)"),
    background: "rgba(245,197,24,0.06)",
    ":hover": {
      color: "#F5C518",
      ...shorthands.borderColor("rgba(245,197,24,0.35)"),
      background: "rgba(245,197,24,0.12)",
    },
  },

  message: {
    padding: "16px 18px",
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },

  sectionLabel: {
    padding: "8px 18px 0",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.03)",
  },

  code: {
    padding: "12px 18px 16px",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: "11px",
    lineHeight: "1.65",
    color: "rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.03)",
    overflowX: "auto",
    whiteSpace: "pre",
    tabSize: "2",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  componentStack: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "10.5px",
  },

  // ── Preview banner ────────────────────────────────────────────────────────
  previewBanner: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    background: "rgba(245,197,24,0.12)",
    borderBottom: "1px solid rgba(245,197,24,0.25)",
    fontSize: "11px",
  },

  previewLabel: {
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#F5C518",
    flexShrink: "0",
  },

  previewSub: {
    color: "rgba(245,197,24,0.55)",
    flex: "1",
  },

  previewBack: {
    color: "#F5C518",
    ...shorthands.borderColor("rgba(245,197,24,0.25)"),
    background: "rgba(245,197,24,0.08)",
    ":hover": {
      background: "rgba(245,197,24,0.15)",
    },
  },

  // ── Prod screen ───────────────────────────────────────────────────────────
  prodRoot: {
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(206,17,38,0.06) 0%, transparent 70%), #0a0a0f",
  },

  prodBody: {
    position: "relative",
    zIndex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "14px",
    padding: "48px 32px",
    maxWidth: "440px",
  },

  prodTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "28px",
    letterSpacing: "0.08em",
    color: "#ffffff",
    textTransform: "uppercase",
  },

  prodSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    lineHeight: "1.6",
  },

  prodSteps: {
    width: "100%",
    marginTop: "4px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    overflow: "hidden",
    textAlign: "left",
  },

  prodStepLabel: {
    padding: "8px 16px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  prodStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    ":last-child": {
      borderBottom: "none",
    },
  },

  prodStepNum: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    marginTop: "1px",
  },

  prodStepBody: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: "1.5",
  },

  prodStepEmphasis: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },

  prodActions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  prodContact: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    marginTop: "4px",
  },

  // ── Action buttons ────────────────────────────────────────────────────────
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#CE1126",
    border: "1px solid #CE1126",
    borderRadius: "6px",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transitionProperty: "background",
    transitionDuration: "0.15s",
    transitionTimingFunction: "ease",
    ":hover": {
      backgroundColor: "#a80d1f",
    },
  },

  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "transparent",
    color: "rgba(255,255,255,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transitionProperty: "background, color, border-color",
    transitionDuration: "0.15s",
    transitionTimingFunction: "ease",
    ":hover": {
      background: "rgba(255,255,255,0.06)",
      color: "#ffffff",
      ...shorthands.borderColor("rgba(255,255,255,0.18)"),
    },
  },
});
