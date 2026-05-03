import { type FC, type ReactNode } from "react";

import { useSettingsRowStyles } from "./SettingsRow.styles.js";

interface Props {
  label: string;
  hint?: string;
  control: ReactNode;
}

export const SettingsRow: FC<Props> = ({ label, hint, control }) => {
  const styles = useSettingsRowStyles();
  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <div className={styles.label}>{label}</div>
        {hint !== undefined && <div className={styles.hint}>{hint}</div>}
      </div>
      <div className={styles.control}>{control}</div>
    </div>
  );
};
