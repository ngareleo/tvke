import type { EventWrapper, NovaEvent } from "@nova/types";

export const ACCOUNT_MENU_ORIGINATOR = "AccountMenu";

export const AccountMenuEventTypes = {
  SETTINGS_REQUESTED: "SettingsRequested",
  SIGN_OUT_REQUESTED: "SignOutRequested",
} as const;

export function createAccountMenuSettingsRequestedEvent(): NovaEvent<undefined> {
  return {
    originator: ACCOUNT_MENU_ORIGINATOR,
    type: AccountMenuEventTypes.SETTINGS_REQUESTED,
    data: () => undefined,
  };
}

export function createAccountMenuSignOutRequestedEvent(): NovaEvent<undefined> {
  return {
    originator: ACCOUNT_MENU_ORIGINATOR,
    type: AccountMenuEventTypes.SIGN_OUT_REQUESTED,
    data: () => undefined,
  };
}

export function isAccountMenuEvent(wrapper: EventWrapper): boolean {
  return wrapper.event.originator === ACCOUNT_MENU_ORIGINATOR;
}

export function isAccountMenuSettingsRequestedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === ACCOUNT_MENU_ORIGINATOR &&
    wrapper.event.type === AccountMenuEventTypes.SETTINGS_REQUESTED
  );
}

export function isAccountMenuSignOutRequestedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === ACCOUNT_MENU_ORIGINATOR &&
    wrapper.event.type === AccountMenuEventTypes.SIGN_OUT_REQUESTED
  );
}
