import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const usePageSkeletonStyles = makeStyles({
  // ── Shared shell ──────────────────────────────────────────────────────────
  statsRow: {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    backgroundColor: tokens.colorSurface,
    flexShrink: "0",
  },
  statCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px 28px",
    borderRight: `1px solid ${tokens.colorBorder}`,
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
    padding: "20px",
  },
  posterCard: {
    borderRadius: tokens.radiusMd,
    overflow: "hidden",
    backgroundColor: tokens.colorSurface2,
  },
  posterImg: {
    paddingBottom: "150%",
  },
  posterInfo: {
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  // ── Dashboard skeletons ───────────────────────────────────────────────────
  hero: {
    height: "220px",
    flexShrink: "0",
  },
  locationBar: {
    height: "38px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    flexShrink: "0",
  },
  dirHeader: {
    display: "grid",
    gridTemplateColumns: "32px 1fr 120px 160px 80px 80px",
    padding: "0 16px",
    height: "32px",
    alignItems: "center",
    gap: "8px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
  },
  dirRow: {
    display: "grid",
    gridTemplateColumns: "32px 1fr 120px 160px 80px 80px",
    padding: "0 16px",
    height: "52px",
    alignItems: "center",
    gap: "8px",
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
  },
  // ── Watchlist skeletons ───────────────────────────────────────────────────
  listItem: {
    display: "grid",
    gridTemplateColumns: "60px 1fr auto auto",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
  },
  listThumb: {
    width: "60px",
    height: "34px",
    borderRadius: "4px",
  },
  listInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  // ── Settings skeletons ────────────────────────────────────────────────────
  tabBar: {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
    padding: "0 4px",
  },
  tab: {
    padding: "0 18px",
    height: "44px",
    display: "flex",
    alignItems: "center",
  },
  settingsBody: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  settingsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingBottom: "24px",
    borderBottom: `1px solid ${tokens.colorBorder}`,
  },
  // ── Layout helpers ────────────────────────────────────────────────────────
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  scrollBody: {
    flex: "1",
    overflowY: "auto",
    padding: "24px",
  },
});
