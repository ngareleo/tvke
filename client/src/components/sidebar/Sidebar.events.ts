import type { EventWrapper, NovaEvent } from "@nova/types";

export const SIDEBAR_ORIGINATOR = "Sidebar";

export const SidebarEventTypes = {
  TOGGLED: "Toggled",
} as const;

export function createSidebarToggledEvent(): NovaEvent<undefined> {
  return {
    originator: SIDEBAR_ORIGINATOR,
    type: SidebarEventTypes.TOGGLED,
    data: () => undefined,
  };
}

export function isSidebarToggledEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SIDEBAR_ORIGINATOR &&
    wrapper.event.type === SidebarEventTypes.TOGGLED
  );
}
