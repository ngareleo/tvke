export interface SeasonInput {
  readonly seasonNumber: number;
  readonly episodes: ReadonlyArray<{
    readonly episodeNumber: number;
    readonly title: string | null;
    readonly durationSeconds: number | null;
    readonly onDisk: boolean;
  }>;
}

export interface ResolvedSeriesPick {
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string | null;
  episodeDurationSeconds: number | null;
}

export function resolveSeriesPick(
  seasons: ReadonlyArray<SeasonInput>,
  s: number | null,
  e: number | null
): ResolvedSeriesPick | null {
  if (seasons.length === 0) return null;

  if (s !== null && e !== null) {
    const season = seasons.find((ss) => ss.seasonNumber === s);
    const episode = season?.episodes.find((ee) => ee.episodeNumber === e);
    if (season && episode) {
      return {
        seasonNumber: season.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        episodeDurationSeconds: episode.durationSeconds,
      };
    }
  }

  for (const season of seasons) {
    const episode = season.episodes.find((ee) => ee.onDisk);
    if (episode) {
      return {
        seasonNumber: season.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        episodeDurationSeconds: episode.durationSeconds,
      };
    }
  }

  const first = seasons[0];
  const firstEpisode = first?.episodes[0];
  if (!first || !firstEpisode) return null;
  return {
    seasonNumber: first.seasonNumber,
    episodeNumber: firstEpisode.episodeNumber,
    episodeTitle: firstEpisode.title,
    episodeDurationSeconds: firstEpisode.durationSeconds,
  };
}
