import { mergeClasses } from "@griffel/react";
import { type FC, type ReactNode } from "react";

import { IconBars, LogoShield } from "~/lib/icons.js";

import { useAppHeaderStyles } from "./AppHeader.styles.js";

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

export const AppHeader: FC<AppHeaderProps> = ({ collapsed, onToggle, children }) => {
  const styles = useAppHeaderStyles();

  return (
    <header className={styles.root}>
      <div className={mergeClasses(styles.brand, collapsed && styles.brandCollapsed)}>
        <LogoShield />
        {!collapsed && (
          <div className={styles.brandText}>
            <div className={styles.logoMark}>MORAN</div>
          </div>
        )}
      </div>

      <button
        className={styles.toggleBtn}
        onClick={onToggle}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        <IconBars size={18} />
      </button>

      <div className={styles.content}>{children}</div>
    </header>
  );
};
