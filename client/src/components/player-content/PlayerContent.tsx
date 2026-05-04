import { mergeClasses } from "@griffel/react";
import { type FC, type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useNavigate, useSearchParams } from "react-router-dom";

import { EdgeHandle } from "~/components/edge-handle/EdgeHandle.js";
import { PlayerSidebarAsync } from "~/components/player-sidebar/PlayerSidebarAsync.js";
import {
  type SeriesPick as VideoAreaSeriesPick,
  VideoArea,
} from "~/components/video-area/VideoArea.js";
import type { PlayerContent_video$key } from "~/relay/__generated__/PlayerContent_video.graphql.js";
import { withViewTransition } from "~/utils/viewTransition.js";

import { usePlayerContentStyles } from "./PlayerContent.styles.js";
import { resolveSeriesPick, type SeasonInput } from "./resolveSeriesPick.js";

const INACTIVITY_MS = 3000;

const VIDEO_FRAGMENT = graphql`
  fragment PlayerContent_video on Video {
    id
    title
    mediaType
    show {
      seasons {
        seasonNumber
        episodes {
          episodeNumber
          title
          durationSeconds
          onDisk
        }
      }
    }
    ...VideoArea_video
    ...PlayerSidebar_video
  }
`;

interface Props {
  video: PlayerContent_video$key;
}

export const PlayerContent: FC<Props> = ({ video }) => {
  const data = useFragment(VIDEO_FRAGMENT, video);
  const styles = usePlayerContentStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const seasonParam = searchParams.get("s");
  const episodeParam = searchParams.get("e");
  const seriesPick = useMemo(() => {
    if (data.mediaType !== "TV_SHOWS") return null;
    const showSeasons = data.show?.seasons ?? [];
    const seasons: ReadonlyArray<SeasonInput> = showSeasons.map((s) => ({
      seasonNumber: s.seasonNumber,
      episodes: s.episodes.map((ep) => ({
        episodeNumber: ep.episodeNumber,
        title: ep.title ?? null,
        durationSeconds: ep.durationSeconds ?? null,
        onDisk: ep.onDisk,
      })),
    }));
    return resolveSeriesPick(
      seasons,
      seasonParam !== null ? Number(seasonParam) : null,
      episodeParam !== null ? Number(episodeParam) : null
    );
  }, [data.mediaType, data.show, seasonParam, episodeParam]);

  const [chromeHidden, setChromeHidden] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number }>(() => ({
    x: typeof window === "undefined" ? 0 : window.innerWidth,
    y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  }));
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armInactivity = useCallback((): void => {
    if (inactivityRef.current !== null) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => setChromeHidden(true), INACTIVITY_MS);
  }, []);

  const wakeChrome = useCallback((): void => {
    setChromeHidden(false);
    armInactivity();
  }, [armInactivity]);

  useEffect(() => {
    armInactivity();
    return () => {
      if (inactivityRef.current !== null) clearTimeout(inactivityRef.current);
    };
  }, [armInactivity]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    wakeChrome();
    setCursor({ x: e.clientX, y: e.clientY });
  };

  const goBackWithTransition = useCallback((): void => {
    withViewTransition(() => navigate(-1));
  }, [navigate]);

  const selectEpisode = useCallback(
    (sNum: number, eNum: number): void => {
      setSearchParams({ s: String(sNum), e: String(eNum) }, { replace: true });
    },
    [setSearchParams]
  );

  const handleEligible = !panelOpen && !chromeHidden;

  const videoAreaPick: VideoAreaSeriesPick | null = seriesPick
    ? {
        seasonNumber: seriesPick.seasonNumber,
        episodeNumber: seriesPick.episodeNumber,
        episodeTitle: seriesPick.episodeTitle,
        episodeDurationSeconds: seriesPick.episodeDurationSeconds,
      }
    : null;

  const sidebarPick = seriesPick
    ? {
        seasonNumber: seriesPick.seasonNumber,
        episodeNumber: seriesPick.episodeNumber,
        episodeTitle: seriesPick.episodeTitle,
      }
    : null;

  return (
    <div
      className={mergeClasses(styles.shell, chromeHidden && styles.shellChromeHidden)}
      onMouseMove={handleMouseMove}
      onClick={wakeChrome}
      onKeyDown={wakeChrome}
      tabIndex={0}
    >
      <VideoArea
        video={data}
        seriesPick={videoAreaPick}
        controlsHidden={chromeHidden}
        onBack={goBackWithTransition}
      />

      {handleEligible && (
        <EdgeHandle cursorX={cursor.x} cursorY={cursor.y} onActivate={() => setPanelOpen(true)} />
      )}

      {panelOpen && !chromeHidden && (
        <div
          aria-hidden="true"
          className={styles.panelScrim}
          onClick={(e) => {
            e.stopPropagation();
            setPanelOpen(false);
          }}
        />
      )}

      <PlayerSidebarAsync
        video={data}
        open={panelOpen && !chromeHidden}
        seriesPick={sidebarPick}
        onClose={() => setPanelOpen(false)}
        onBack={goBackWithTransition}
        onSelectEpisode={selectEpisode}
      />
    </div>
  );
};
