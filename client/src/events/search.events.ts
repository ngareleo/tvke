import type { EventWrapper, NovaEvent } from "@nova/types";

export const SEARCH_ORIGINATOR = "search";

export const SearchEventTypes = {
  CLEARED: "Cleared",
  FILTER_OPEN_REQUESTED: "FilterOpenRequested",
  FILTER_CLOSED: "FilterClosed",
  FILTERS_CLEARED: "FiltersCleared",
} as const;

export function createSearchClearedEvent(): NovaEvent<undefined> {
  return {
    originator: SEARCH_ORIGINATOR,
    type: SearchEventTypes.CLEARED,
    data: () => undefined,
  };
}

export function createFilterOpenRequestedEvent(): NovaEvent<undefined> {
  return {
    originator: SEARCH_ORIGINATOR,
    type: SearchEventTypes.FILTER_OPEN_REQUESTED,
    data: () => undefined,
  };
}

export function createFilterClosedEvent(): NovaEvent<undefined> {
  return {
    originator: SEARCH_ORIGINATOR,
    type: SearchEventTypes.FILTER_CLOSED,
    data: () => undefined,
  };
}

export function createFiltersClearedEvent(): NovaEvent<undefined> {
  return {
    originator: SEARCH_ORIGINATOR,
    type: SearchEventTypes.FILTERS_CLEARED,
    data: () => undefined,
  };
}

export function isSearchEvent(wrapper: EventWrapper): boolean {
  return wrapper.event.originator === SEARCH_ORIGINATOR;
}

export function isSearchClearedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SEARCH_ORIGINATOR &&
    wrapper.event.type === SearchEventTypes.CLEARED
  );
}

export function isFilterOpenRequestedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SEARCH_ORIGINATOR &&
    wrapper.event.type === SearchEventTypes.FILTER_OPEN_REQUESTED
  );
}

export function isFilterClosedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SEARCH_ORIGINATOR &&
    wrapper.event.type === SearchEventTypes.FILTER_CLOSED
  );
}

export function isFiltersClearedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SEARCH_ORIGINATOR &&
    wrapper.event.type === SearchEventTypes.FILTERS_CLEARED
  );
}
