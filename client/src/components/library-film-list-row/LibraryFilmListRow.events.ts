import type { EventWrapper, NovaEvent } from "@nova/types";

export const LIBRARY_FILM_LIST_ROW_ORIGINATOR = "LibraryFilmListRow";

export const LibraryFilmListRowEventTypes = {
  FILM_SELECTED: "FilmSelected",
} as const;

export interface FilmSelectedData {
  videoId: string;
}

export function createFilmSelectedEvent(videoId: string): NovaEvent<FilmSelectedData> {
  return {
    originator: LIBRARY_FILM_LIST_ROW_ORIGINATOR,
    type: LibraryFilmListRowEventTypes.FILM_SELECTED,
    data: () => ({ videoId }),
  };
}

export function isFilmSelectedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LIBRARY_FILM_LIST_ROW_ORIGINATOR &&
    wrapper.event.type === LibraryFilmListRowEventTypes.FILM_SELECTED
  );
}
