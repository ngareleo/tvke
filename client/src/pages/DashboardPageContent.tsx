import { mergeClasses } from "@griffel/react";
import React, { type FC, Suspense, useCallback, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useSearchParams } from "react-router-dom";

import { FilmDetailPane } from "~/components/film-detail-pane/FilmDetailPane.js";
import { NewProfilePane } from "~/components/new-profile-pane/NewProfilePane.js";
import { ProfileRow } from "~/components/profile-row/ProfileRow.js";
import { Slideshow } from "~/components/slideshow/Slideshow.js";
import { IconPlus } from "~/lib/icons.js";
import type { DashboardPageContentDetailQuery } from "~/relay/__generated__/DashboardPageContentDetailQuery.graphql.js";
import type { DashboardPageContentQuery } from "~/relay/__generated__/DashboardPageContentQuery.graphql.js";
import { formatFileSize } from "~/utils/formatters.js";

import { useDashboardStyles } from "./DashboardPage.styles.js";

const DASHBOARD_QUERY = graphql`
  query DashboardPageContentQuery {
    libraries {
      id
      stats {
        totalCount
        totalSizeBytes
      }
      ...ProfileRow_library
    }
  }
`;

const DETAIL_VIDEO_QUERY = graphql`
  query DashboardPageContentDetailQuery($videoId: ID!) {
    video(id: $videoId) {
      ...FilmDetailPane_video
    }
  }
`;

// ─── Detail pane loader ───────────────────────────────────────────────────────

interface DetailLoaderProps {
  filmId: string;
  onClose: () => void;
}

const DetailLoader: FC<DetailLoaderProps> = ({ filmId, onClose }) => {
  const data = useLazyLoadQuery<DashboardPageContentDetailQuery>(DETAIL_VIDEO_QUERY, {
    videoId: filmId,
  });
  if (!data.video) return null;
  return <FilmDetailPane video={data.video} onClose={onClose} />;
};

// ─── Main component ───────────────────────────────────────────────────────────

export const DashboardPageContent: FC = () => {
  const styles = useDashboardStyles();
  const data = useLazyLoadQuery<DashboardPageContentQuery>(DASHBOARD_QUERY, {});

  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const paneParam = searchParams.get("pane");
  const filmIdParam = searchParams.get("filmId");

  const isPaneFilmDetail = paneParam === "film-detail" && Boolean(filmIdParam);
  const isPaneNewProfile = paneParam === "new-profile";
  const isPaneOpen = isPaneFilmDetail || isPaneNewProfile;

  const openNewProfile = (): void => {
    setSearchParams({ pane: "new-profile" });
  };

  const closePane = useCallback((): void => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleFilmSelect = useCallback(
    (id: string): void => {
      if (isPaneFilmDetail && filmIdParam === id) {
        closePane();
      } else {
        setSearchParams({ pane: "film-detail", filmId: id });
      }
    },
    [isPaneFilmDetail, filmIdParam, closePane, setSearchParams]
  );

  const handleToggle = useCallback((id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleLibraryCreated = (): void => {
    closePane();
  };

  const totalFiles = data.libraries.reduce((s, l) => s + l.stats.totalCount, 0);
  const totalBytes = data.libraries.reduce((s, l) => s + l.stats.totalSizeBytes, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className={mergeClasses(styles.splitBody, isPaneOpen && styles.splitBodyPaneOpen)}>
        {/* Left column */}
        <div className={styles.splitLeft}>
          {/* Hero */}
          <div className={styles.hero}>
            <Slideshow />
            <div className={styles.greeting}>
              <div className={styles.greetingText}>
                Your <span className={styles.greetingName}>Library</span>
              </div>
              <div className={styles.greetingSub}>
                {totalFiles} files · {formatFileSize(totalBytes)}
              </div>
            </div>
          </div>

          {/* Location bar */}
          <div className={styles.locationBar}>
            <span
              style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}
            >
              Profiles
            </span>
            <span className={styles.locSep}>/</span>
            <span className={styles.locCurrent}>All Libraries</span>
            <div className={styles.headerActions}>
              <button
                className={mergeClasses(styles.headerActionBtn, styles.headerActionBtnPrimary)}
                onClick={openNewProfile}
                type="button"
              >
                <IconPlus size={11} />
                New Library
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className={styles.dirHeader}>
            <div />
            <div className={styles.dirCol}>Name</div>
            <div className={styles.dirCol}>Count</div>
            <div className={styles.dirCol}>Match</div>
            <div className={styles.dirCol}>Size</div>
            <div className={styles.dirCol}>Actions</div>
          </div>

          {/* Library rows */}
          <div className={styles.dirList}>
            {data.libraries.map((lib) => (
              <ProfileRow
                key={lib.id}
                library={lib}
                expanded={expandedId === lib.id}
                selected={isPaneFilmDetail}
                onToggle={() => handleToggle(lib.id)}
                onFilmSelect={handleFilmSelect}
              />
            ))}
          </div>

          {/* Footer */}
          <div className={styles.dirFooter}>
            <span className={styles.dirFooterStat}>
              Libraries <span className={styles.dirFooterStatNum}>{data.libraries.length}</span>
            </span>
            <span className={styles.dirFooterStat}>
              Files <span className={styles.dirFooterStatNum}>{totalFiles}</span>
            </span>
            <span className={styles.dirFooterStat}>
              Total <span className={styles.dirFooterStatNum}>{formatFileSize(totalBytes)}</span>
            </span>
          </div>
        </div>

        {/* Right pane */}
        <div className={styles.rightPane}>
          {isPaneNewProfile && (
            <NewProfilePane onClose={closePane} onCreated={handleLibraryCreated} />
          )}
          {isPaneFilmDetail && filmIdParam && (
            <Suspense fallback={null}>
              <DetailLoader filmId={filmIdParam} onClose={closePane} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};
