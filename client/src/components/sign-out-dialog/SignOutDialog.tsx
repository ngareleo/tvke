import { useNovaEventing } from "@nova/react";
import { type FC } from "react";

import { useSidebarStyles } from "~/components/sidebar/Sidebar.styles.js";
import { IconSignOut, IconWarning } from "~/lib/icons.js";

import {
  createSignOutDialogCancelledEvent,
  createSignOutDialogConfirmedEvent,
} from "./SignOutDialog.events.js";
import { strings } from "./SignOutDialog.strings.js";

export const SignOutDialog: FC = () => {
  const styles = useSidebarStyles();
  const { bubble } = useNovaEventing();

  return (
    <div
      className={styles.dialogOverlay}
      onClick={(e) => {
        void bubble({ reactEvent: e, event: createSignOutDialogCancelledEvent() });
      }}
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogIcon}>
          <IconWarning size={20} />
        </div>
        <div className={styles.dialogTitle}>{strings.title}</div>
        <div className={styles.dialogBody}>{strings.body}</div>
        <div className={styles.dialogActions}>
          <button
            className={styles.btnGhost}
            onClick={(e) => {
              void bubble({ reactEvent: e, event: createSignOutDialogCancelledEvent() });
            }}
            type="button"
          >
            {strings.cancel}
          </button>
          <button
            className={styles.btnDanger}
            onClick={(e) => {
              void bubble({ reactEvent: e, event: createSignOutDialogConfirmedEvent() });
            }}
            type="button"
          >
            <IconSignOut size={12} />
            {strings.signOut}
          </button>
        </div>
      </div>
    </div>
  );
};
