import type { EventWrapper } from "@nova/types";

import type { Resolution } from "../types.js";

export const CONTROL_BAR_ORIGINATOR = "ControlBar";

export const ControlBarEventTypes = {
  PLAY_REQUESTED: "PlayRequested",
  RESOLUTION_CHANGED: "ResolutionChanged",
} as const;

export type ControlBarEventType = (typeof ControlBarEventTypes)[keyof typeof ControlBarEventTypes];

export interface ResolutionChangedData {
  resolution: Resolution;
}

export function isControlBarEvent(wrapper: EventWrapper): boolean {
  return wrapper.event.originator === CONTROL_BAR_ORIGINATOR;
}
