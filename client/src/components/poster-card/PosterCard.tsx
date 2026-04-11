import { mergeClasses } from "@griffel/react";
import React, { type FC, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { Link } from "react-router-dom";

import { IconPlay, IconQuestion } from "~/lib/icons.js";
import type { PosterCard_video$key } from "~/relay/__generated__/PosterCard_video.graphql.js";

import { usePosterCardStyles } from "./PosterCard.styles.js";

const POSTER_FRAGMENT = graphql`
  fragment PosterCard_video on Video {
    id
    title
    matched
    mediaType
    metadata {
      year
      rating
      posterUrl
    }
    videoStream {
      height
    }
  }
`;

// Gradient placeholders indexed by video id hash for visual variety
const GRADIENTS = [
  "linear-gradient(135deg, #1a0a0a 0%, #3d0b0b 50%, #0a0a0a 100%)",
  "linear-gradient(135deg, #0a0a1a 0%, #0b1a3d 50%, #0a0a0a 100%)",
  "linear-gradient(135deg, #0a1a0a 0%, #0b3d1a 50%, #0a0a0a 100%)",
  "linear-gradient(135deg, #1a0f0a 0%, #3d2008 50%, #0a0a0a 100%)",
  "linear-gradient(135deg, #12080f 0%, #2e0a24 50%, #0a0a0a 100%)",
  "linear-gradient(135deg, #080e1a 0%, #0a2040 50%, #0a0a0a 100%)",
];

function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

interface Props {
  video: PosterCard_video$key;
  onSelect: (id: string) => void;
}

export const PosterCard: FC<Props> = ({ video, onSelect }) => {
  const data = useFragment(POSTER_FRAGMENT, video);
  const styles = usePosterCardStyles();
  const [hovered, setHovered] = useState(false);

  const isHd = (data.videoStream?.height ?? 0) >= 2160;
  const bgStyle = data.metadata?.posterUrl
    ? { backgroundImage: `url(${data.metadata.posterUrl})` }
    : { background: gradientForId(data.id) };

  return (
    <div
      className={styles.root}
      onClick={() => onSelect(data.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(data.id);
      }}
    >
      <div className={styles.inner}>
        {/* Background */}
        <div className={styles.bg} style={bgStyle} />
        <div className={styles.bottomGradient} />
        <div className={mergeClasses(styles.hoverOverlay, hovered && styles.hoverOverlayVisible)} />

        {/* Top-right badge */}
        <div className={styles.badgeTopRight}>
          <span className={mergeClasses(styles.badge, isHd ? styles.badgeRed : styles.badgeGray)}>
            {isHd ? "4K" : "HD"}
          </span>
        </div>

        {/* Top-left: unmatched indicator */}
        {!data.matched && (
          <div className={styles.badgeTopLeft}>
            <span className={mergeClasses(styles.badge, styles.badgeYellow)}>
              <IconQuestion size={8} />
            </span>
          </div>
        )}

        {/* Play chip (hover) */}
        {data.matched && (
          <Link
            to={`/player/${data.id}`}
            className={mergeClasses(styles.playChip, hovered && styles.playChipVisible)}
            onClick={(e) => e.stopPropagation()}
          >
            <IconPlay size={9} />
            Play
          </Link>
        )}

        {/* Bottom info */}
        <div className={styles.bottomInfo}>
          <div className={styles.title}>{data.title}</div>
          {data.metadata?.year && <div className={styles.year}>{data.metadata.year}</div>}
        </div>

        {/* Rating */}
        {data.metadata?.rating != null && (
          <div className={styles.rating}>★ {data.metadata.rating.toFixed(1)}</div>
        )}
      </div>
    </div>
  );
};
