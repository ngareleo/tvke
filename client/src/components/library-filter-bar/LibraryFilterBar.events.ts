import type { EventWrapper, NovaEvent } from "@nova/types";

export type TypeFilter = "all" | "MOVIES" | "TV_SHOWS";

export const LIBRARY_FILTER_BAR_ORIGINATOR = "LibraryFilterBar";

export const LibraryFilterBarEventTypes = {
  SEARCH_CHANGED: "SearchChanged",
  TYPE_FILTER_CHANGED: "TypeFilterChanged",
  VIEW_CHANGED: "ViewChanged",
} as const;

export interface SearchChangedData {
  value: string;
}

export interface TypeFilterChangedData {
  value: TypeFilter;
}

export interface ViewChangedData {
  isGrid: boolean;
}

export function createSearchChangedEvent(value: string): NovaEvent<SearchChangedData> {
  return {
    originator: LIBRARY_FILTER_BAR_ORIGINATOR,
    type: LibraryFilterBarEventTypes.SEARCH_CHANGED,
    data: () => ({ value }),
  };
}

export function createTypeFilterChangedEvent(value: TypeFilter): NovaEvent<TypeFilterChangedData> {
  return {
    originator: LIBRARY_FILTER_BAR_ORIGINATOR,
    type: LibraryFilterBarEventTypes.TYPE_FILTER_CHANGED,
    data: () => ({ value }),
  };
}

export function createViewChangedEvent(isGrid: boolean): NovaEvent<ViewChangedData> {
  return {
    originator: LIBRARY_FILTER_BAR_ORIGINATOR,
    type: LibraryFilterBarEventTypes.VIEW_CHANGED,
    data: () => ({ isGrid }),
  };
}

export function isSearchChangedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LIBRARY_FILTER_BAR_ORIGINATOR &&
    wrapper.event.type === LibraryFilterBarEventTypes.SEARCH_CHANGED
  );
}

export function isTypeFilterChangedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LIBRARY_FILTER_BAR_ORIGINATOR &&
    wrapper.event.type === LibraryFilterBarEventTypes.TYPE_FILTER_CHANGED
  );
}

export function isViewChangedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LIBRARY_FILTER_BAR_ORIGINATOR &&
    wrapper.event.type === LibraryFilterBarEventTypes.VIEW_CHANGED
  );
}
