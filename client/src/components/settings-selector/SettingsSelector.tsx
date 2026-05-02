import { type FC } from "react";

import { useSettingsSelectorStyles } from "./SettingsSelector.styles.js";

interface Props {
  value: string;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export const SettingsSelector: FC<Props> = ({ value, onClick, ariaLabel, disabled = false }) => {
  const styles = useSettingsSelectorStyles();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || onClick === undefined}
      aria-label={ariaLabel}
      className={styles.button}
    >
      <span className={styles.value}>{value}</span>
      <span className={styles.chevron} aria-hidden="true">
        ▾
      </span>
    </button>
  );
};
