import { makeStyles, mergeClasses } from "@griffel/react";
import React, { type FC, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useNavigate, useParams } from "react-router-dom";

import { PlayerSidebarAsync } from "~/components/player-sidebar/PlayerSidebarAsync.js";
import { VideoPlayerAsync } from "~/components/video-player/VideoPlayerAsync.js";
import { IconArrowLeft } from "~/lib/icons.js";
import type { PlayerPageQuery } from "~/relay/__generated__/PlayerPageQuery.graphql.js";
import { tokens } from "~/styles/tokens.js";

const usePlayerStyles = makeStyles({
  root: {
    position: "fixed",
    inset: "0",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorBlack,
    fontFamily: tokens.fontBody,
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    height: "54px",
    backgroundColor: tokens.colorSurface,
    borderBottom: `1px solid ${tokens.colorBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: "0",
    zIndex: "10",
    transitionProperty: "opacity, transform",
    transitionDuration: "0.3s",
  },
  topBarHidden: {
    opacity: "0",
    transform: "translateY(-100%)",
    pointerEvents: "none",
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    color: tokens.colorMuted,
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: tokens.radiusSm,
    fontSize: "13px",
    fontWeight: "500",
    transitionProperty: "color, background",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
  },
  videoTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: tokens.colorWhite,
    maxWidth: "400px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  // ── Body ───────────────────────────────────────────────────────────────────
  body: {
    flex: "1",
    display: "flex",
    minHeight: "0",
  },
  videoArea: {
    flex: "1",
    position: "relative",
    backgroundColor: "#000",
  },

  // Loading skeleton
  skeleton: {
    flex: "1",
    display: "flex",
    minHeight: "0",
  },
  skeletonVideo: {
    flex: "1",
    backgroundColor: "#000",
  },
  skeletonSidebar: {
    width: tokens.playerPanelWidth,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
    borderLeft: `1px solid ${tokens.colorBorder}`,
  },
});

const VIDEO_QUERY = graphql`
  query PlayerPageQuery($id: ID!) {
    video(id: $id) {
      title
      ...VideoPlayer_video
      ...PlayerSidebar_video
    }
  }
`;

function resolveVideoId(param: string): string {
  const decoded = decodeURIComponent(param);
  try {
    if (atob(decoded).startsWith("Video:")) return decoded;
  } catch {
    // not valid base64 — fall through
  }
  return btoa(`Video:${decoded}`);
}

// ─── PlayerContent ────────────────────────────────────────────────────────────

const INACTIVITY_MS = 3000;

const PlayerContent: FC<{ videoId: string }> = ({ videoId }) => {
  const navigate = useNavigate();
  const styles = usePlayerStyles();
  const data = useLazyLoadQuery<PlayerPageQuery>(VIDEO_QUERY, { id: videoId });

  const [controlsHidden, setControlsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback((): void => {
    setControlsHidden(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setControlsHidden(true), INACTIVITY_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  if (!data.video) {
    return <div style={{ padding: 32, color: "#f0f0f5" }}>Video not found.</div>;
  }

  return (
    <div
      className={styles.root}
      onMouseMove={resetTimer}
      onKeyDown={resetTimer}
      style={{ cursor: controlsHidden ? "none" : undefined }}
    >
      {/* Top bar */}
      <div className={mergeClasses(styles.topBar, controlsHidden && styles.topBarHidden)}>
        <div className={styles.topBarLeft}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Go back"
            type="button"
          >
            <IconArrowLeft size={14} />
            Back
          </button>
          <span className={styles.videoTitle}>{data.video.title}</span>
        </div>
      </div>

      {/* Body */}
      <Suspense
        fallback={
          <div className={styles.skeleton}>
            <div className={styles.skeletonVideo} />
            <div className={styles.skeletonSidebar} />
          </div>
        }
      >
        <div className={styles.body}>
          <div className={styles.videoArea}>
            <VideoPlayerAsync video={data.video} />
          </div>
          <PlayerSidebarAsync video={data.video} />
        </div>
      </Suspense>
    </div>
  );
};

// ─── PlayerPage ───────────────────────────────────────────────────────────────

export const PlayerPage: FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const styles = usePlayerStyles();

  if (!videoId) {
    return <div style={{ padding: 32, color: "#f0f0f5" }}>Invalid video ID.</div>;
  }

  return (
    <Suspense
      fallback={
        <div
          className={mergeClasses(styles.root)}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${tokens.colorBorder}`,
              borderTopColor: tokens.colorRed,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <PlayerContent videoId={resolveVideoId(videoId)} />
    </Suspense>
  );
};
