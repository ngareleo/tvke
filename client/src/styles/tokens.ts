/**
 * Design tokens — the single source of truth for the Moran visual language.
 * Used by all Griffel makeStyles() calls so that colour and spacing are
 * centrally defined and easy to update.
 *
 * Colour palette is inspired by the Kenyan flag: red (#CE1126), black (#080808),
 * and white, with dark surface neutrals for the app shell.
 */

export const tokens = {
  // ── Colours ───────────────────────────────────────────────────────────────
  colorRed: "#CE1126",
  colorRedDark: "#A50D1E",
  colorRedDim: "rgba(206, 17, 38, 0.12)",
  colorRedBorder: "rgba(206, 17, 38, 0.28)",

  colorBlack: "#080808",
  colorSurface: "#0F0F0F",
  colorSurface2: "#161616",
  colorSurface3: "#1C1C1C",
  colorBorder: "#222222",
  colorBorder2: "#2E2E2E",

  colorWhite: "#FFFFFF",
  colorOffWhite: "#F0EEEB",
  colorMuted: "#666666",
  colorMuted2: "#3E3E3E",

  colorGreen: "#27AE60",
  colorYellow: "#F5C518",

  // ── Typography ────────────────────────────────────────────────────────────
  fontHead: "'Bebas Neue', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",

  // ── Border radius ─────────────────────────────────────────────────────────
  radiusSm: "4px",
  radiusMd: "8px",
  radiusLg: "12px",
  radiusFull: "9999px",

  // ── Spacing ───────────────────────────────────────────────────────────────
  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",
  space5: "20px",
  space6: "24px",

  // ── Transitions ───────────────────────────────────────────────────────────
  transition: "0.15s ease",
  transitionSlow: "0.25s ease",

  // ── Layout dimensions ─────────────────────────────────────────────────────
  headerHeight: "52px",
  sidebarWidth: "220px",
  sidebarCollapsedWidth: "52px",
  rightPaneWidth: "360px",
  playerPanelWidth: "290px",
} as const;

export type Tokens = typeof tokens;
