import { mergeClasses } from "@griffel/react";
import { type FC } from "react";

import { strings } from "./AccountMenu.strings.js";
import { useAccountMenuStyles } from "./AccountMenu.styles.js";

interface AccountMenuProps {
  initials: string;
  name: string;
  email: string;
  onSettings: () => void;
  onSignOut: () => void;
}

export const AccountMenu: FC<AccountMenuProps> = ({
  initials,
  name,
  email,
  onSettings,
  onSignOut,
}) => {
  const styles = useAccountMenuStyles();
  return (
    <div className={styles.menu} role="menu">
      <div className={styles.identity}>
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
        <div className={styles.identityText}>
          <span className={styles.name}>{name}</span>
          <span className={styles.email}>{email}</span>
        </div>
      </div>
      <div className={styles.list}>
        <button type="button" role="menuitem" className={styles.item} onClick={onSettings}>
          {strings.settings}
          <span className={styles.itemArrow}>→</span>
        </button>
        <button
          type="button"
          role="menuitem"
          className={mergeClasses(styles.item, styles.itemDanger)}
          onClick={onSignOut}
        >
          {strings.signOut}
        </button>
      </div>
    </div>
  );
};
