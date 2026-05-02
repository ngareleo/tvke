import { mergeClasses } from "@griffel/react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useSearchParams } from "react-router-dom";

import {
  FilmDetailsOverlay,
  type FilmDetailsViewModel,
} from "~/components/film-details-overlay/FilmDetailsOverlay";
import { FilmTile, type FilmTileViewModel } from "~/components/film-tile/FilmTile";
import { FilterSlide } from "~/components/filter-slide/FilterSlide";
import { PosterRow } from "~/components/poster-row/PosterRow";
import { SearchSlide } from "~/components/search-slide/SearchSlide";
import { type SeasonViewModel } from "~/components/seasons-panel/SeasonsPanel";
import { IconClose, IconSearch } from "~/lib/icons";
import type { LibraryPageContentQuery } from "~/relay/__generated__/LibraryPageContentQuery.graphql.js";
import {
  applyFilters,
  type Codec,
  EMPTY_FILTERS,
  type FilterableFilm,
  type Filters,
  filtersActive,
  type Hdr,
  type Resolution,
} from "~/utils/filters";

import { strings } from "./LibraryPage.strings";
import { useLibraryStyles } from "./LibraryPage.styles";

const LIBRARY_QUERY = graphql`
  query LibraryPageContentQuery {
    videos(first: 200) {
      edges {
        node {
          id
          title
          filename
          mediaType
          durationSeconds
          nativeResolution
          metadata {
            year
            genre
            director
            plot
            posterUrl
            rating
          }
          videoStream {
            codec
          }
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
      }
    }
    watchlist {
      id
      progressSeconds
      video {
        id
      }
    }
  }
`;

interface LibraryFilm extends FilterableFilm {
  id: string;
  title: string | null;
  filename: string;
  kind: "MOVIES" | "TV_SHOWS";
  posterUrl: string | null;
  year: number | null;
  durationLabel: string | null;
  durationFull: string | null;
  genre: string | null;
  director: string | null;
  plot: string | null;
  rating: number | null;
  hdrLabel: string | null;
  resolutionLabel: string | null;
  codecLabel: string | null;
  seasons: SeasonViewModel[];
}

const RESOLUTION_LABEL: Record<string, Resolution> = {
  RESOLUTION_4K: "4K",
  RESOLUTION_1080P: "1080p",
  RESOLUTION_720P: "720p",
};

function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function asViewModel(film: LibraryFilm): FilmTileViewModel {
  return {
    id: film.id,
    title: film.title,
    filename: film.filename,
    kind: film.kind,
    posterUrl: film.posterUrl,
    year: film.year,
    durationLabel: film.durationLabel,
  };
}

function pickSuggestions(film: LibraryFilm, all: LibraryFilm[]): FilmTileViewModel[] {
  const tokens = (film.genre ?? "")
    .toLowerCase()
    .split(/[·\s/]+/)
    .filter(Boolean);
  const scored: { film: LibraryFilm; score: number }[] = [];
  for (const f of all) {
    if (f.id === film.id) continue;
    let score = 0;
    if (f.director && film.director && f.director === film.director) score += 50;
    const fGenre = (f.genre ?? "").toLowerCase();
    for (const t of tokens) {
      if (t.length > 2 && fGenre.includes(t)) score += 12;
    }
    if (f.resolution === film.resolution) score += 2;
    scored.push({ film: f, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((s) => asViewModel(s.film));
}

function toDetailsViewModel(film: LibraryFilm): FilmDetailsViewModel {
  return {
    id: film.id,
    title: film.title,
    filename: film.filename,
    posterUrl: film.posterUrl,
    kind: film.kind,
    resolution: film.resolutionLabel,
    hdr: film.hdrLabel,
    codec: film.codecLabel,
    year: film.year,
    genre: film.genre,
    duration: film.durationFull,
    director: film.director,
    plot: film.plot,
    rating: film.rating,
    seasons: film.seasons,
  };
}

export const LibraryPageContent: FC = () => {
  const styles = useLibraryStyles();
  const data = useLazyLoadQuery<LibraryPageContentQuery>(LIBRARY_QUERY, {});
  const [params, setParams] = useSearchParams();

  const films = useMemo<LibraryFilm[]>(() => {
    const edges = data.videos?.edges ?? [];
    return edges.map((edge) => {
      const node = edge.node;
      const meta = node.metadata;
      const codec = (node.videoStream?.codec ?? null) as Codec | null;
      const resolution = node.nativeResolution
        ? (RESOLUTION_LABEL[node.nativeResolution] ?? null)
        : null;
      const seasons: SeasonViewModel[] = (node.seasons ?? []).map((season) => ({
        number: season.seasonNumber,
        episodes: season.episodes.map((ep) => ({
          number: ep.episodeNumber,
          title: ep.title ?? null,
          duration: formatDuration(ep.durationSeconds),
          available: ep.onDisk,
        })),
      }));
      return {
        id: node.id,
        title: node.title,
        filename: node.filename,
        kind: node.mediaType as "MOVIES" | "TV_SHOWS",
        posterUrl: meta?.posterUrl ?? null,
        year: meta?.year ?? null,
        durationLabel: formatDuration(node.durationSeconds),
        durationFull: formatDuration(node.durationSeconds),
        genre: meta?.genre ?? null,
        director: meta?.director ?? null,
        plot: meta?.plot ?? null,
        rating: meta?.rating ?? null,
        hdrLabel: null,
        resolutionLabel: resolution,
        codecLabel: codec,
        resolution: resolution ?? "1080p",
        hdr: null as Hdr | null,
        codec: (codec ?? "HEVC") as Codec,
        seasons,
      };
    });
  }, [data]);

  const watchlistEntries = useMemo(() => {
    const items = data.watchlist ?? [];
    const filmsById = new Map(films.map((f) => [f.id, f]));
    return items
      .map((item) => {
        const film = filmsById.get(item.video.id);
        if (!film) return null;
        return { id: item.id, film, progressSeconds: item.progressSeconds };
      })
      .filter((x): x is { id: string; film: LibraryFilm; progressSeconds: number } => x !== null);
  }, [data, films]);

  const filmId = params.get("film");
  const selectedFilm = filmId ? films.find((f) => f.id === filmId) : undefined;

  const continueWatching = useMemo(
    () => watchlistEntries.filter((w) => w.progressSeconds > 0),
    [watchlistEntries]
  );
  const watchlistRest = useMemo(
    () => watchlistEntries.filter((w) => w.progressSeconds === 0),
    [watchlistEntries]
  );
  const newReleases = useMemo(() => films.slice(0, 12), [films]);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const trimmedQuery = search.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;
  const activeFilterCount = filtersActive(filters);
  const showFlatResults = hasQuery || activeFilterCount > 0;
  const heroMode: "idle" | "searching" | "filtering" = filterOpen
    ? "filtering"
    : searchFocused || showFlatResults
      ? "searching"
      : "idle";

  const queryMatched = useMemo<LibraryFilm[]>(() => {
    if (!trimmedQuery) return films;
    return films.filter((f) => {
      const title = (f.title ?? "").toLowerCase();
      const filename = f.filename.toLowerCase();
      const director = (f.director ?? "").toLowerCase();
      const genre = (f.genre ?? "").toLowerCase();
      return (
        title.includes(trimmedQuery) ||
        filename.includes(trimmedQuery) ||
        director.includes(trimmedQuery) ||
        genre.includes(trimmedQuery)
      );
    });
  }, [films, trimmedQuery]);

  const searchResults = useMemo<LibraryFilm[]>(
    () => applyFilters(queryMatched, filters),
    [queryMatched, filters]
  );

  const clearAll = useCallback((): void => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setFilterOpen(false);
    setSearchFocused(false);
  }, []);

  useEffect(() => {
    if (heroMode === "idle") return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      if (filterOpen) setFilterOpen(false);
      else clearAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heroMode, filterOpen, clearAll]);

  const openFilm = useCallback(
    (id: string): void => {
      const next = new URLSearchParams(params);
      next.set("film", id);
      setParams(next);
    },
    [params, setParams]
  );

  const closeFilm = useCallback((): void => {
    const next = new URLSearchParams(params);
    next.delete("film");
    setParams(next);
  }, [params, setParams]);

  if (selectedFilm) {
    const suggestions = pickSuggestions(selectedFilm, films);
    return (
      <FilmDetailsOverlay
        film={toDetailsViewModel(selectedFilm)}
        suggestions={suggestions}
        onSelectSuggestion={openFilm}
        onClose={closeFilm}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={mergeClasses(styles.hero, heroMode !== "idle" && styles.heroActive)}>
        {heroMode !== "idle" && <div className={styles.heroPanelBg} />}

        <div
          className={mergeClasses(
            styles.searchBar,
            (searchFocused || heroMode !== "idle") && styles.searchBarFocused
          )}
        >
          <span className={styles.searchIcon} aria-hidden="true">
            <IconSearch />
          </span>
          <div className={styles.searchInputWrap}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
              placeholder={searchFocused ? "" : strings.searchPlaceholder}
              className={styles.searchInput}
              aria-label={strings.searchAriaLabel}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          {showFlatResults && (
            <button
              type="button"
              onClick={clearAll}
              aria-label={strings.clearAriaLabel}
              className={styles.searchClear}
            >
              <IconClose size={12} />
            </button>
          )}
        </div>

        <div className={styles.heroBody}>
          {heroMode === "idle" && (
            <div>
              <div className={styles.greetingEyebrow}>· {strings.libraryEyebrow}</div>
              <div className={styles.greeting}>{strings.libraryHeading}</div>
            </div>
          )}
          {heroMode === "searching" && (
            <SearchSlide
              query={search}
              resultCount={searchResults.length}
              totalMatched={queryMatched.length}
              profilesMatched={1}
              activeFilterCount={activeFilterCount}
              onOpenFilter={() => setFilterOpen(true)}
              onClear={clearAll}
            />
          )}
          {heroMode === "filtering" && (
            <FilterSlide
              query={search}
              filters={filters}
              setFilters={setFilters}
              resultCount={searchResults.length}
              totalMatched={queryMatched.length}
              profileCount={1}
              onClose={() => setFilterOpen(false)}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
            />
          )}
        </div>
      </div>

      <div className={styles.rowsScroll}>
        {showFlatResults ? (
          searchResults.length > 0 ? (
            <div className={styles.searchResults}>
              <div className={styles.rowHeader}>
                {hasQuery
                  ? (strings.formatString(strings.resultsFormat, {
                      n: searchResults.length,
                    }) as string)
                  : (strings.formatString(strings.filteredFormat, {
                      n: searchResults.length,
                      total: films.length,
                    }) as string)}
              </div>
              <div className={styles.searchGrid}>
                {searchResults.map((film) => (
                  <FilmTile
                    key={film.id}
                    film={asViewModel(film)}
                    onClick={() => openFilm(film.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noResults}>
              {hasQuery
                ? (strings.formatString(strings.noResultsForQuery, {
                    query: search.trim(),
                  }) as string)
                : strings.noResultsForFilters}
            </div>
          )
        ) : (
          <>
            {continueWatching.length > 0 && (
              <PosterRow title={strings.rowContinueWatching}>
                {continueWatching.map(({ id, film, progressSeconds }) => {
                  const total = film.durationLabel ? 1 : 1;
                  const progress = total > 0 && film.durationLabel ? progressSeconds : undefined;
                  return (
                    <FilmTile
                      key={id}
                      film={asViewModel(film)}
                      progress={progress}
                      onClick={() => openFilm(film.id)}
                    />
                  );
                })}
              </PosterRow>
            )}

            {newReleases.length > 0 && (
              <PosterRow title={strings.rowNewReleases}>
                {newReleases.map((film) => (
                  <FilmTile
                    key={film.id}
                    film={asViewModel(film)}
                    onClick={() => openFilm(film.id)}
                  />
                ))}
              </PosterRow>
            )}

            {watchlistRest.length > 0 && (
              <PosterRow title={strings.rowWatchlist}>
                {watchlistRest.map(({ id, film }) => (
                  <FilmTile key={id} film={asViewModel(film)} onClick={() => openFilm(film.id)} />
                ))}
              </PosterRow>
            )}
          </>
        )}
      </div>
    </div>
  );
};
