import { type FC, type ReactNode } from "react";

import { LogoShield } from "~/lib/icons.js";

import { useAppHeaderStyles } from "./AppHeader.styles.js";

interface AppHeaderProps {
  children?: ReactNode;
}

export const AppHeader: FC<AppHeaderProps> = ({ children }) => {
  const styles = useAppHeaderStyles();

  return (
    <header className={styles.root}>
      <div className={styles.brand}>
        <LogoShield />
        <div className={styles.brandText}>
          <div className={styles.logoMark}>MORAN</div>
        </div>
      </div>

      <div className={styles.content}>{children}</div>
    </header>
  );
};
