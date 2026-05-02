import type { EventWrapper, NovaEvent } from "@nova/types";

export const APP_HEADER_ORIGINATOR = "AppHeader";

export const AppHeaderEventTypes = {
  SCAN_REQUESTED: "ScanRequested",
} as const;

export function createAppHeaderScanRequestedEvent(): NovaEvent<Record<string, never>> {
  return {
    originator: APP_HEADER_ORIGINATOR,
    type: AppHeaderEventTypes.SCAN_REQUESTED,
    data: () => ({}),
  };
}

export function isAppHeaderEvent(wrapper: EventWrapper): boolean {
  return wrapper.event.originator === APP_HEADER_ORIGINATOR;
}

export function isAppHeaderScanRequestedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === APP_HEADER_ORIGINATOR &&
    wrapper.event.type === AppHeaderEventTypes.SCAN_REQUESTED
  );
}
