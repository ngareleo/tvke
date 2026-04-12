import type { EventWrapper, NovaEvent } from "@nova/types";

export const SIGN_OUT_DIALOG_ORIGINATOR = "SignOutDialog";

export const SignOutDialogEventTypes = {
  CANCELLED: "Cancelled",
  CONFIRMED: "Confirmed",
} as const;

export function createSignOutDialogCancelledEvent(): NovaEvent<undefined> {
  return {
    originator: SIGN_OUT_DIALOG_ORIGINATOR,
    type: SignOutDialogEventTypes.CANCELLED,
    data: () => undefined,
  };
}

export function createSignOutDialogConfirmedEvent(): NovaEvent<undefined> {
  return {
    originator: SIGN_OUT_DIALOG_ORIGINATOR,
    type: SignOutDialogEventTypes.CONFIRMED,
    data: () => undefined,
  };
}

export function isSignOutDialogCancelledEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SIGN_OUT_DIALOG_ORIGINATOR &&
    wrapper.event.type === SignOutDialogEventTypes.CANCELLED
  );
}

export function isSignOutDialogConfirmedEvent(wrapper: EventWrapper): boolean {
  return (
    wrapper.event.originator === SIGN_OUT_DIALOG_ORIGINATOR &&
    wrapper.event.type === SignOutDialogEventTypes.CONFIRMED
  );
}
