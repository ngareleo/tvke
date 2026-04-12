import type { EventWrapper, NovaEvent } from "@nova/types";

export const FILM_DETAIL_LOADER_ORIGINATOR = "FilmDetailLoader";

export const FilmDetailLoaderEventTypes = {
  LIBRARY_ID_RESOLVED: "LibraryIdResolved",
} as const;

export interface LibraryIdResolvedData {
  libraryId: string;
}

export function createLibraryIdResolvedEvent(libraryId: string): NovaEvent<LibraryIdResolvedData> {
  return {
    originator: FILM_DETAIL_LOADER_ORIGINATOR,
    type: FilmDetailLoaderEventTypes.LIBRARY_ID_RESOLVED,
    data: () => ({ libraryId }),
  };
}

export function isLibraryIdResolvedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === FILM_DETAIL_LOADER_ORIGINATOR &&
    wrapper.event.type === FilmDetailLoaderEventTypes.LIBRARY_ID_RESOLVED
  );
}
