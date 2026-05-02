import { mergeClasses } from "@griffel/react";
import { type FC, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { FilmTile, type FilmTileViewModel } from "~/components/film-tile/FilmTile";
import { Poster } from "~/components/poster/Poster";
import { PosterRow } from "~/components/poster-row/PosterRow";
import { SeasonsPanel, type SeasonViewModel } from "~/components/seasons-panel/SeasonsPanel";
import { IconClose, IconPlay, ImdbBadge } from "~/lib/icons";
import { withViewTransition } from "~/utils/viewTransition";

import { strings } from "./FilmDetailsOverlay.strings";
import { useFilmDetailsOverlayStyles } from "./FilmDetailsOverlay.styles";

export interface FilmDetailsViewModel {
  id: string;
  title: string | null;
  filename: string;
  posterUrl: string | null;
  kind: "MOVIES" | "TV_SHOWS";
  resolution: string | null;
  hdr: string | null;
  codec: string | null;
  year: number | null;
  genre: string | null;
  duration: string | null;
  director: string | null;
  plot: string | null;
  rating: number | null;
  seasons: SeasonViewModel[];
}

interface FilmDetailsOverlayProps {
  film: FilmDetailsViewModel;
  suggestions?: FilmTileViewModel[];
  onClose: () => void;
  onSelectSuggestion?: (id: string) => void;
}

export const FilmDetailsOverlay: FC<FilmDetailsOverlayProps> = ({
  film,
  suggestions = [],
  onClose,
  onSelectSuggestion,
}) => {
  const styles = useFilmDetailsOverlayStyles();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isSeries = film.kind === "TV_SHOWS";
  const altText = film.title ?? film.filename;
  const titleText = film.title ?? strings.unmatched;

  const totalEpisodes = film.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
  const availableEpisodes = film.seasons.reduce(
    (sum, s) => sum + s.episodes.filter((e) => e.available).length,
    0
  );

  const playWithTransition = (): void => {
    withViewTransition(() => navigate(`/player/${film.id}`));
  };

  const playEpisode = (seasonNumber: number, episodeNumber: number): void => {
    navigate(`/player/${film.id}?s=${seasonNumber}&e=${episodeNumber}`);
  };

  const handleSuggestionClick = (id: string): void => {
    overlayRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (onSelectSuggestion) onSelectSuggestion(id);
    else navigate(`/player/${id}`);
  };

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div className={styles.hero}>
        <Poster url={film.posterUrl} alt={altText} className={styles.poster} />
        <div className={styles.gradient} />
        <button
          type="button"
          onClick={onClose}
          aria-label={strings.closeAriaLabel}
          className={styles.close}
        >
          <IconClose />
        </button>
        <div className={mergeClasses(styles.content, isSeries && styles.contentWithRail)}>
          <div className={styles.chips}>
            {film.resolution && (
              <span className={mergeClasses(styles.chip, styles.chipGreen)}>{film.resolution}</span>
            )}
            {film.hdr && film.hdr !== "—" && <span className={styles.chip}>{film.hdr}</span>}
            {film.codec && <span className={styles.chip}>{film.codec}</span>}
            {film.rating !== null && (
              <span className={styles.rating}>
                <ImdbBadge />
                {film.rating}
              </span>
            )}
          </div>
          <div className={styles.title}>{titleText}</div>
          <div className={styles.metaRow}>
            {[film.year, film.genre, film.duration]
              .filter((v): v is string | number => v !== null && v !== undefined)
              .join(" · ")}
          </div>
          {film.director && (
            <div className={styles.director}>
              {strings.directedBy}
              <span className={styles.directorName}>{film.director}</span>
            </div>
          )}
          {film.plot && <div className={styles.plot}>{film.plot}</div>}
          <div className={styles.actions}>
            <button type="button" onClick={playWithTransition} className={styles.playCta}>
              <IconPlay />
              <span>{strings.play}</span>
            </button>
            <span className={styles.filename}>{film.filename}</span>
          </div>
          {suggestions.length > 0 && (
            <div className={styles.scrollHint} aria-hidden="true">
              {strings.scrollHint}
            </div>
          )}
        </div>
        {isSeries && film.seasons.length > 0 && (
          <aside className={styles.seasonsRail} aria-label={strings.seasonsAriaLabel}>
            <div className={styles.seasonsRailHeader}>
              <span className={styles.seasonsRailLabel}>
                {film.seasons.length} {film.seasons.length === 1 ? strings.season : strings.seasons}
              </span>
              <span className={styles.seasonsRailStat}>
                {strings.formatString(strings.onDiskFormat, {
                  onDisk: availableEpisodes,
                  total: totalEpisodes,
                })}
              </span>
            </div>
            <div className={styles.seasonsRailScroll}>
              <SeasonsPanel seasons={film.seasons} defaultOpenFirst onSelectEpisode={playEpisode} />
            </div>
          </aside>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <PosterRow title={strings.youMightAlsoLike}>
            {suggestions.map((suggestion) => (
              <FilmTile
                key={suggestion.id}
                film={suggestion}
                onClick={() => handleSuggestionClick(suggestion.id)}
              />
            ))}
          </PosterRow>
        </div>
      )}
    </div>
  );
};
