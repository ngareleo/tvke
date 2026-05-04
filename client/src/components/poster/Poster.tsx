import { mergeClasses } from "@griffel/react";
import { type FC, useEffect, useState } from "react";

import { resolvePosterUrl } from "~/config/rustOrigin.js";
import { upgradePosterUrl } from "~/utils/formatters.js";

import { strings } from "./Poster.strings.js";
import { usePosterStyles } from "./Poster.styles.js";

interface PosterProps {
  url: string | null;
  alt: string;
  className?: string;
  /**
   * Target poster width in CDN pixels. OMDb/Amazon URLs come in at
   * `_SX300` by default; we rewrite that segment so the image arrives at
   * the size the consumer actually needs (default 800 covers most carousel
   * tiles at retina). Pass a higher value for full-bleed surfaces and a
   * smaller value for thumbs. Non-OMDb URLs pass through unchanged.
   */
  width?: number;
}

export const Poster: FC<PosterProps> = ({ url, alt, className, width = 800 }) => {
  const styles = usePosterStyles();
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [url]);

  if (!url || errored) {
    return (
      <div className={mergeClasses(styles.placeholder, className)}>
        {alt || strings.fallbackLabel}
      </div>
    );
  }

  // For locally cached posters (`/poster/<basename>`) prepend the
  // server origin so the dev client (different port from the server)
  // can fetch them. Then run the OMDb size upgrader, which is a no-op
  // on local URLs.
  const resolved = resolvePosterUrl(url) ?? url;

  return (
    <img
      src={upgradePosterUrl(resolved, width)}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={mergeClasses(styles.image, className)}
    />
  );
};
