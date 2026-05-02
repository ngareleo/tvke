import { type FC, type ReactNode } from "react";

import { AppHeader } from "~/components/app-header/AppHeader.js";

import { useAppShellStyles } from "./AppShell.styles.js";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: FC<AppShellProps> = ({ children }) => {
  const styles = useAppShellStyles();

  return (
    <div className={styles.shell}>
      <AppHeader />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
