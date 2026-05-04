import { mergeClasses } from "@griffel/react";
import { useNovaEventing } from "@nova/react";
import { type FC, type MouseEvent } from "react";

import {
  createAccountMenuSettingsRequestedEvent,
  createAccountMenuSignOutRequestedEvent,
} from "./AccountMenu.events.js";
import { strings } from "./AccountMenu.strings.js";
import { useAccountMenuStyles } from "./AccountMenu.styles.js";

interface AccountMenuProps {
  initials: string;
  name: string;
  email: string;
}

export const AccountMenu: FC<AccountMenuProps> = ({ initials, name, email }) => {
  const styles = useAccountMenuStyles();
  const { bubble } = useNovaEventing();

  const handleSettings = (e: MouseEvent<HTMLButtonElement>): void => {
    void bubble({ reactEvent: e, event: createAccountMenuSettingsRequestedEvent() });
  };

  const handleSignOut = (e: MouseEvent<HTMLButtonElement>): void => {
    void bubble({ reactEvent: e, event: createAccountMenuSignOutRequestedEvent() });
  };

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
        <button type="button" role="menuitem" className={styles.item} onClick={handleSettings}>
          {strings.settings}
          <span className={styles.itemArrow}>→</span>
        </button>
        <button
          type="button"
          role="menuitem"
          className={mergeClasses(styles.item, styles.itemDanger)}
          onClick={handleSignOut}
        >
          {strings.signOut}
        </button>
      </div>
    </div>
  );
};
