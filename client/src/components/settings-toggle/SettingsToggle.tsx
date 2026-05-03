import { mergeClasses } from "@griffel/react";
import { type FC } from "react";

import { useSettingsToggleStyles } from "./SettingsToggle.styles.js";

interface Props {
  on: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export const SettingsToggle: FC<Props> = ({ on, onChange, ariaLabel, disabled = false }) => {
  const styles = useSettingsToggleStyles();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={mergeClasses(styles.track, on && styles.trackOn, disabled && styles.disabled)}
    >
      <span className={mergeClasses(styles.knob, on && styles.knobOn)} />
    </button>
  );
};
