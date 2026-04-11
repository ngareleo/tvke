import { mergeClasses } from "@griffel/react";
import React, { type FC } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import type { WatchlistPageContentQuery } from "~/relay/__generated__/WatchlistPageContentQuery.graphql.js";
import type { WatchlistPageContentRemoveMutation } from "~/relay/__generated__/WatchlistPageContentRemoveMutation.graphql.js";

import { useWatchlistStyles } from "./WatchlistPage.styles.js";

const WATCHLIST_QUERY = graphql`
  query WatchlistPageContentQuery {
    watchlist {
      id
      progressSeconds
      addedAt
      video {
        id
        title
        durationSeconds
        metadata {
          year
          genre
          rating
          posterUrl
        }
      }
    }
  }
`;

const REMOVE_MUTATION = graphql`
  mutation WatchlistPageContentRemoveMutation($id: ID!) {
    removeFromWatchlist(id: $id)
  }
`;

export const WatchlistPageContent: FC = () => {
  const styles = useWatchlistStyles();
  const data = useLazyLoadQuery<WatchlistPageContentQuery>(WATCHLIST_QUERY, {});
  const [removeItem] = useMutation<WatchlistPageContentRemoveMutation>(REMOVE_MUTATION);

  const items = data.watchlist;

  const queued = items.filter((i) => i.progressSeconds === 0).length;
  const inProgress = items.filter(
    (i) => i.progressSeconds > 0 && i.progressSeconds < i.video.durationSeconds - 30
  ).length;
  const watched = items.filter((i) => i.progressSeconds >= i.video.durationSeconds - 30).length;

  const continuing = items.filter((i) => i.progressSeconds > 0);

  const handleRemove = (id: string): void => {
    removeItem({ variables: { id } });
  };

  if (items.length === 0) {
    return (
      <div className={mergeClasses(styles.root)}>
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Your Watchlist is Empty</div>
          <div className={styles.emptyBody}>
            Browse your{" "}
            <Link to="/library" className={styles.emptyLink}>
              Library
            </Link>{" "}
            and add titles to keep track of what you want to watch.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{queued}</span>
          <span className={styles.statLabel}>Queued</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{inProgress}</span>
          <span className={styles.statLabel}>In Progress</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{watched}</span>
          <span className={styles.statLabel}>Watched</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* Continue Watching rail */}
        {continuing.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Continue Watching</div>
            <div className={styles.rail}>
              {continuing.map((item) => {
                const pct =
                  item.video.durationSeconds > 0
                    ? (item.progressSeconds / item.video.durationSeconds) * 100
                    : 0;
                const thumbStyle = item.video.metadata?.posterUrl
                  ? { backgroundImage: `url(${item.video.metadata.posterUrl})` }
                  : undefined;
                return (
                  <Link
                    key={item.id}
                    to={`/player/${item.video.id}`}
                    className={styles.railCard}
                    style={{ textDecoration: "none" }}
                  >
                    <div className={styles.railThumb} style={thumbStyle}>
                      <div className={styles.railProgress}>
                        <div className={styles.railProgressFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className={styles.railInfo}>
                      <div className={styles.railTitle}>{item.video.title}</div>
                      {item.video.metadata?.year && (
                        <div className={styles.railYear}>{item.video.metadata.year}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* All titles list */}
        <div className={styles.sectionTitle}>All Titles</div>
        {items.map((item) => {
          const pct =
            item.video.durationSeconds > 0
              ? (item.progressSeconds / item.video.durationSeconds) * 100
              : 0;
          const thumbStyle = item.video.metadata?.posterUrl
            ? { backgroundImage: `url(${item.video.metadata.posterUrl})` }
            : undefined;
          const meta = [item.video.metadata?.year, item.video.metadata?.genre]
            .filter(Boolean)
            .join(" · ");

          return (
            <div key={item.id} className={styles.listRow}>
              <div className={styles.listThumb} style={thumbStyle} />
              <div className={styles.listInfo}>
                <div className={styles.listTitle}>{item.video.title}</div>
                {meta && <div className={styles.listMeta}>{meta}</div>}
              </div>
              <div className={styles.listProgress}>
                <div className={styles.listProgressFill} style={{ width: `${pct}%` }} />
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(item.id)}
                title="Remove from watchlist"
                type="button"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
