import { type FC } from "react";

import { IconSignOut, IconWarning } from "~/lib/icons.js";

import { useSidebarStyles } from "./Sidebar.styles.js";

export interface SignOutDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const SignOutDialog: FC<SignOutDialogProps> = ({ onCancel, onConfirm }) => {
  const styles = useSidebarStyles();
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogIcon}>
          <IconWarning size={20} />
        </div>
        <div className={styles.dialogTitle}>Sign out of Moran?</div>
        <div className={styles.dialogBody}>
          You&apos;ll need to sign back in to access your library. Any active streams will stop.
        </div>
        <div className={styles.dialogActions}>
          <button className={styles.btnGhost} onClick={onCancel} type="button">
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={onConfirm} type="button">
            <IconSignOut size={12} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
