import { mergeClasses } from "@griffel/react";
import { type CSSProperties, type FC, useMemo, useState } from "react";

import { IconCheck, IconChevron } from "~/lib/icons";

import { strings } from "./SeasonsPanel.strings";
import { useSeasonsPanelStyles } from "./SeasonsPanel.styles";

export interface EpisodeViewModel {
  number: number;
  title: string | null;
  duration: string | null;
  available: boolean;
  watched?: boolean;
  progress?: number;
}

export interface SeasonViewModel {
  number: number;
  episodes: EpisodeViewModel[];
}

export interface ActiveEpisode {
  seasonNumber: number;
  episodeNumber: number;
}

interface SeasonsPanelProps {
  seasons: SeasonViewModel[];
  defaultOpenFirst?: boolean;
  activeEpisode?: ActiveEpisode;
  onSelectEpisode?: (seasonNumber: number, episodeNumber: number) => void;
  accordion?: boolean;
}

export const SeasonsPanel: FC<SeasonsPanelProps> = ({
  seasons,
  defaultOpenFirst = false,
  activeEpisode,
  onSelectEpisode,
  accordion = false,
}) => {
  const styles = useSeasonsPanelStyles();
  const initial = useMemo<Set<number>>(() => {
    const set = new Set<number>();
    if (activeEpisode) {
      set.add(activeEpisode.seasonNumber);
      if (accordion) return set;
    }
    if (defaultOpenFirst && seasons.length > 0) {
      const first = seasons[0];
      if (first) set.add(first.number);
    }
    return set;
  }, [defaultOpenFirst, seasons, activeEpisode, accordion]);
  const [expanded, setExpanded] = useState<Set<number>>(initial);

  const toggle = (n: number): void => {
    setExpanded((prev) => {
      if (accordion) {
        if (prev.has(n)) return new Set<number>();
        return new Set<number>([n]);
      }
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  return (
    <div className={styles.panel}>
      {seasons.map((season) => {
        const total = season.episodes.length;
        const available = season.episodes.filter((e) => e.available).length;
        const watchedCount = season.episodes.filter((e) => e.watched === true).length;
        const pct = total === 0 ? 0 : (available / total) * 100;
        const status = available === total ? "complete" : available === 0 ? "empty" : "partial";
        const isOpen = expanded.has(season.number);

        return (
          <div key={season.number} className={styles.season}>
            <button
              type="button"
              onClick={() => toggle(season.number)}
              className={mergeClasses(styles.seasonHeader, isOpen && styles.seasonHeaderOpen)}
              aria-expanded={isOpen}
            >
              <span
                className={mergeClasses(styles.chevron, isOpen && styles.chevronOpen)}
                aria-hidden="true"
              >
                <IconChevron />
              </span>
              <span className={styles.seasonLabel}>
                <span className={styles.seasonName}>
                  {strings.formatString(strings.seasonName, { n: season.number })}
                </span>
                <span className={styles.seasonMeta}>
                  {strings.formatString(strings.onDiskFormat, {
                    onDisk: available,
                    total,
                  })}
                  {watchedCount > 0 && (
                    <span className={styles.seasonMetaWatched}>
                      {" "}
                      · {strings.formatString(strings.watchedFormat, { n: watchedCount })}
                    </span>
                  )}
                </span>
              </span>
              <span className={styles.miniBar} aria-hidden="true">
                <span
                  className={mergeClasses(
                    styles.miniFill,
                    status === "partial" && styles.miniFillPartial
                  )}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span
                className={mergeClasses(
                  styles.seasonStatus,
                  status === "complete" && styles.seasonStatusComplete,
                  status === "partial" && styles.seasonStatusPartial,
                  status === "empty" && styles.seasonStatusEmpty
                )}
              >
                {status === "complete"
                  ? strings.statusOnDisk
                  : status === "empty"
                    ? strings.statusMissing
                    : strings.statusPartial}
              </span>
            </button>

            {isOpen && (
              <div className={styles.episodes}>
                {season.episodes.map((ep) => {
                  const code = `S${String(season.number).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
                  const isActive =
                    activeEpisode !== undefined &&
                    activeEpisode.seasonNumber === season.number &&
                    activeEpisode.episodeNumber === ep.number;
                  const clickable = Boolean(onSelectEpisode) && ep.available;
                  const isWatched = ep.watched === true && !isActive;
                  const isInProgress =
                    !isActive &&
                    ep.watched !== true &&
                    typeof ep.progress === "number" &&
                    ep.progress > 0 &&
                    ep.progress < 100;

                  const statusEl = !ep.available ? (
                    <span
                      className={mergeClasses(styles.episodeDot, styles.episodeDotMissing)}
                      aria-label={strings.dotMissing}
                      title={strings.dotMissing}
                    />
                  ) : isWatched ? (
                    <span
                      className={mergeClasses(styles.episodeStatus, styles.episodeCheck)}
                      aria-label={strings.dotWatched}
                      title={strings.dotWatched}
                    >
                      <IconCheck size={12} />
                    </span>
                  ) : isInProgress ? (
                    <span
                      className={mergeClasses(styles.episodeDot, styles.episodeDotInProgress)}
                      style={{ "--ep-pct": `${ep.progress}%` } as CSSProperties}
                      aria-label={
                        strings.formatString(strings.dotInProgress, {
                          pct: ep.progress ?? 0,
                        }) as string
                      }
                      title={
                        strings.formatString(strings.dotInProgress, {
                          pct: ep.progress ?? 0,
                        }) as string
                      }
                    />
                  ) : (
                    <span
                      className={styles.episodeDot}
                      aria-label={strings.dotOnDisk}
                      title={strings.dotOnDisk}
                    />
                  );

                  const titleText =
                    ep.title ??
                    (strings.formatString(strings.episodeFallback, { n: ep.number }) as string);

                  const rowContent = (
                    <>
                      <span
                        className={mergeClasses(
                          styles.episodeCode,
                          isWatched && styles.episodeWatchedCode
                        )}
                      >
                        {code}
                      </span>
                      <span
                        className={mergeClasses(
                          styles.episodeTitle,
                          isWatched && styles.episodeWatchedTitle
                        )}
                        title={titleText}
                      >
                        {isActive && (
                          <span className={styles.episodePlayingMark}>{strings.playing}</span>
                        )}
                        {titleText}
                      </span>
                      <span className={styles.episodeDuration}>{ep.duration ?? ""}</span>
                      {statusEl}
                      {isInProgress && (
                        <span className={styles.episodeInProgressBar} aria-hidden="true">
                          <span
                            className={styles.episodeInProgressFill}
                            style={{ width: `${ep.progress}%` }}
                          />
                        </span>
                      )}
                    </>
                  );

                  const rowClass = mergeClasses(
                    styles.episode,
                    !ep.available && styles.episodeMissing,
                    isWatched && styles.episodeWatched,
                    isActive && styles.episodeActive
                  );

                  if (clickable && onSelectEpisode) {
                    return (
                      <button
                        type="button"
                        key={ep.number}
                        onClick={() => onSelectEpisode(season.number, ep.number)}
                        aria-current={isActive ? "true" : undefined}
                        className={mergeClasses(
                          rowClass,
                          styles.episodeButton,
                          styles.episodeButtonAvailable
                        )}
                      >
                        {rowContent}
                      </button>
                    );
                  }

                  return (
                    <div key={ep.number} className={rowClass}>
                      {rowContent}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
