import { mergeClasses } from "@griffel/react";
import { type FC, type ReactNode, useState } from "react";

import { AppHeader } from "~/components/app-header/AppHeader.js";
import { Sidebar } from "~/components/sidebar/Sidebar.js";

import { useAppShellStyles } from "./AppShell.styles.js";

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell provides the CSS grid: header (row 1, full-width), sidebar (row 2
 * col 1), main (row 2 col 2). Each page renders a page-specific header slot +
 * <div className={styles.main}> as children.
 */
export const AppShell: FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const styles = useAppShellStyles();

  return (
    <div className={mergeClasses(styles.root, collapsed && styles.rootCollapsed)}>
      <AppHeader />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={styles.main}>{children}</div>
    </div>
  );
};
