import type { EventWrapper, NovaEvent } from "@nova/types";

export const LIBRARY_CHIPS_ORIGINATOR = "LibraryChips";

export const LibraryChipsEventTypes = {
  ACTIVE_LIBRARY_CHANGED: "ActiveLibraryChanged",
} as const;

export interface ActiveLibraryChangedData {
  libraryId: string | null;
}

export function createActiveLibraryChangedEvent(
  libraryId: string | null
): NovaEvent<ActiveLibraryChangedData> {
  return {
    originator: LIBRARY_CHIPS_ORIGINATOR,
    type: LibraryChipsEventTypes.ACTIVE_LIBRARY_CHANGED,
    data: () => ({ libraryId }),
  };
}

export function isActiveLibraryChangedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LIBRARY_CHIPS_ORIGINATOR &&
    wrapper.event.type === LibraryChipsEventTypes.ACTIVE_LIBRARY_CHANGED
  );
}
