import type { EventWrapper, NovaEvent } from "@nova/types";

export const PROFILE_EXPLORER_ORIGINATOR = "ProfileExplorer";

export const ProfileExplorerEventTypes = {
  PROFILE_CLEARED: "ProfileCleared",
} as const;

export function createProfileClearedEvent(): NovaEvent<undefined> {
  return {
    originator: PROFILE_EXPLORER_ORIGINATOR,
    type: ProfileExplorerEventTypes.PROFILE_CLEARED,
    data: () => undefined,
  };
}

export function isProfileClearedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === PROFILE_EXPLORER_ORIGINATOR &&
    wrapper.event.type === ProfileExplorerEventTypes.PROFILE_CLEARED
  );
}
