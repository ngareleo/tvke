import LocalizedStrings from "react-localization";

export const strings = new LocalizedStrings({
  en: {
    seasonName: "Season {n}",
    onDiskFormat: "{onDisk} of {total} on disk",
    watchedFormat: "✓ {n} watched",
    statusOnDisk: "ON DISK",
    statusPartial: "PARTIAL",
    statusMissing: "MISSING",
    playing: "● PLAYING",
    episodeFallback: "Episode {n}",
    dotOnDisk: "On disk",
    dotMissing: "Missing",
    dotWatched: "Watched",
    dotInProgress: "In progress — {pct}%",
  },
});
