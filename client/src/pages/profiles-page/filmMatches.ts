interface MatchableFilm {
  readonly title: string | null | undefined;
  readonly filename: string;
  readonly metadata:
    | {
        readonly genre?: string | null | undefined;
        readonly director?: string | null | undefined;
      }
    | null
    | undefined;
}

/**
 * Case-insensitive substring search across a film's title, filename,
 * director, and genre. The query is expected to be already trimmed and
 * lowercased by the caller.
 */
export function filmMatches(film: MatchableFilm, query: string): boolean {
  if (!query) return true;
  const title = (film.title ?? "").toLowerCase();
  const filename = film.filename.toLowerCase();
  const director = (film.metadata?.director ?? "").toLowerCase();
  const genre = (film.metadata?.genre ?? "").toLowerCase();
  return (
    title.includes(query) ||
    filename.includes(query) ||
    director.includes(query) ||
    genre.includes(query)
  );
}
