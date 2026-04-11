import { mergeClasses } from "@griffel/react";
import React, { type FC, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useNavigate, useParams } from "react-router-dom";

import { DevThrowTarget } from "~/components/dev-tools/DevToolsContext.js";
import { PlayerSidebarAsync } from "~/components/player-sidebar/PlayerSidebarAsync.js";
import { VideoPlayerAsync } from "~/components/video-player/VideoPlayerAsync.js";
import { IconArrowLeft } from "~/lib/icons.js";
import type { PlayerPageQuery } from "~/relay/__generated__/PlayerPageQuery.graphql.js";

import { usePlayerStyles } from "./PlayerPage.styles.js";

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

const INACTIVITY_MS = 3000;

// ─── PlayerContent ────────────────────────────────────────────────────────────

const PlayerContent: FC<{ videoId: string }> = ({ videoId }) => {
  const navigate = useNavigate();
  const styles = usePlayerStyles();
  const data = useLazyLoadQuery<PlayerPageQuery>(VIDEO_QUERY, { id: videoId });

  const [controlsHidden, setControlsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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
    return <div className={styles.notFound}>Video not found.</div>;
  }

  return (
    <DevThrowTarget id="Player">
      <div
        ref={rootRef}
        className={mergeClasses(styles.root, controlsHidden && styles.rootHidden)}
        onMouseMove={resetTimer}
        onKeyDown={resetTimer}
        tabIndex={0}
      >
        {/* ── Video column ─────────────────────────────────────────────────── */}
        <div className={styles.videoArea}>
          {/* Atmospheric layers */}
          <div className={styles.scene} />
          <div className={styles.grain} />
          <div className={styles.letterbox} />

          {/* MSE video player */}
          <Suspense
            fallback={
              <div className={styles.skeleton}>
                <div className={styles.spinner} />
              </div>
            }
          >
            <div className={styles.videoWrapper}>
              <VideoPlayerAsync video={data.video} />
            </div>
          </Suspense>

          {/* Topbar overlay */}
          <div className={mergeClasses(styles.topBar, controlsHidden && styles.topBarHidden)}>
            <button
              className={styles.backBtn}
              onClick={() => navigate(-1)}
              aria-label="Go back"
              type="button"
            >
              <IconArrowLeft size={14} />
              Back
            </button>
            <div className={styles.topDivider} />
            <div className={styles.videoTitle}>{data.video.title}</div>
          </div>
        </div>

        {/* ── Side panel column ────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          <PlayerSidebarAsync video={data.video} hidden={controlsHidden} />
        </Suspense>
      </div>
    </DevThrowTarget>
  );
};

// ─── PlayerPage ───────────────────────────────────────────────────────────────

export const PlayerPage: FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const styles = usePlayerStyles();

  if (!videoId) {
    return <div className={styles.notFound}>Invalid video ID.</div>;
  }

  return (
    <Suspense
      fallback={
        <div className={styles.root} style={{ alignItems: "center", justifyContent: "center" }}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <PlayerContent videoId={resolveVideoId(videoId)} />
    </Suspense>
  );
};
