import type { EventWrapper, NovaEvent } from "@nova/types";

export const LINK_SEARCH_ORIGINATOR = "LinkSearch";

export const LinkSearchEventTypes = {
  SUGGESTION_SELECTED: "SuggestionSelected",
  CANCELLED: "Cancelled",
} as const;

export interface SuggestionSelectedData {
  imdbId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
}

export function createSuggestionSelectedEvent(
  suggestion: SuggestionSelectedData
): NovaEvent<SuggestionSelectedData> {
  return {
    originator: LINK_SEARCH_ORIGINATOR,
    type: LinkSearchEventTypes.SUGGESTION_SELECTED,
    data: () => suggestion,
  };
}

export function createLinkSearchCancelledEvent(): NovaEvent<undefined> {
  return {
    originator: LINK_SEARCH_ORIGINATOR,
    type: LinkSearchEventTypes.CANCELLED,
    data: () => undefined,
  };
}

export function isSuggestionSelectedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LINK_SEARCH_ORIGINATOR &&
    wrapper.event.type === LinkSearchEventTypes.SUGGESTION_SELECTED
  );
}

export function isLinkSearchCancelledEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === LINK_SEARCH_ORIGINATOR &&
    wrapper.event.type === LinkSearchEventTypes.CANCELLED
  );
}
