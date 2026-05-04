import type { EventWrapper, NovaEvent } from "@nova/types";

export const DIRECTORY_BROWSER_ORIGINATOR = "DirectoryBrowser";

export const DirectoryBrowserEventTypes = {
  DIRECTORY_SELECTED: "DirectorySelected",
  CANCELLED: "Cancelled",
} as const;

export interface DirectorySelectedData {
  path: string;
}

export function createDirectorySelectedEvent(path: string): NovaEvent<DirectorySelectedData> {
  return {
    originator: DIRECTORY_BROWSER_ORIGINATOR,
    type: DirectoryBrowserEventTypes.DIRECTORY_SELECTED,
    data: () => ({ path }),
  };
}

export function createDirectoryBrowserCancelledEvent(): NovaEvent<undefined> {
  return {
    originator: DIRECTORY_BROWSER_ORIGINATOR,
    type: DirectoryBrowserEventTypes.CANCELLED,
    data: () => undefined,
  };
}

export function isDirectoryBrowserEvent(wrapper: EventWrapper): boolean {
  return wrapper.event.originator === DIRECTORY_BROWSER_ORIGINATOR;
}

export function isDirectorySelectedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === DIRECTORY_BROWSER_ORIGINATOR &&
    wrapper.event.type === DirectoryBrowserEventTypes.DIRECTORY_SELECTED
  );
}

export function isDirectoryBrowserCancelledEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === DIRECTORY_BROWSER_ORIGINATOR &&
    wrapper.event.type === DirectoryBrowserEventTypes.CANCELLED
  );
}
