import { type FC, useMemo } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link } from "react-router-dom";

import { Poster } from "~/components/poster/Poster";
import { ImdbBadge } from "~/lib/icons";
import type { WatchlistPageContentQuery } from "~/relay/__generated__/WatchlistPageContentQuery.graphql";
import { formatDurationHuman } from "~/utils/formatters";

import { strings } from "./WatchlistPage.strings";
import { useWatchlistPageStyles } from "./WatchlistPage.styles";
import { formatAddedAt, progressPercent, resolutionLabel } from "./WatchlistPageContent.utils";

const WATCHLIST_QUERY = graphql`
  query WatchlistPageContentQuery {
    watchlist {
      id
      addedAt
      progressSeconds
      video {
        id
        title
        filename
        durationSeconds
        nativeResolution
        metadata {
          year
          rating
          posterUrl
        }
      }
    }
  }
`;

export const WatchlistPageContent: FC = () => {
  const styles = useWatchlistPageStyles();
  const data = useLazyLoadQuery<WatchlistPageContentQuery>(WATCHLIST_QUERY, {});
  const items = data.watchlist ?? [];
  const titleText =
    items.length === 0
      ? strings.emptyTitle
      : (strings.formatString(strings.titleFormat, { n: items.length }) as string);

  const tiles = useMemo(
    () =>
      items.map((item) => {
        const altText = item.video.title || item.video.filename;
        const subtitleParts = [
          item.video.metadata?.year ?? null,
          item.video.durationSeconds > 0 ? formatDurationHuman(item.video.durationSeconds) : null,
          resolutionLabel(item.video.nativeResolution),
        ].filter((v): v is string | number => v !== null && v !== "");
        const progress = progressPercent(item.progressSeconds, item.video.durationSeconds);
        return {
          id: item.id,
          videoId: item.video.id,
          altText,
          posterUrl: item.video.metadata?.posterUrl ?? null,
          rating: item.video.metadata?.rating ?? null,
          subtitle: subtitleParts.join(" · "),
          addedAt: item.addedAt,
          progress,
        };
      }),
    [items]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>{strings.eyebrow}</div>
        <div className={styles.title}>{titleText}</div>
        <div className={styles.subtitle}>{strings.subtitle}</div>
      </div>

      {tiles.length === 0 ? (
        <div className={styles.empty}>{strings.emptyBody}</div>
      ) : (
        <div className={styles.grid}>
          {tiles.map((tile) => (
            <Link key={tile.id} to={`/?film=${tile.videoId}`} className={styles.tile}>
              <div className={styles.tileFrame}>
                <Poster url={tile.posterUrl} alt={tile.altText} className={styles.tileImage} />
                {tile.progress !== null && (
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${tile.progress}%` }} />
                  </div>
                )}
                {tile.rating !== null && (
                  <div className={styles.ratingBadge}>
                    <ImdbBadge />
                    {tile.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className={styles.tileMeta}>
                <div className={styles.tileTitle}>{tile.altText}</div>
                {tile.subtitle && <div className={styles.tileSubtitle}>{tile.subtitle}</div>}
                <div className={styles.tileAdded}>
                  {
                    strings.formatString(strings.addedPrefix, {
                      when: formatAddedAt(tile.addedAt),
                    }) as string
                  }
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
