import { makeStyles } from "@griffel/react";

import { tokens } from "~/styles/tokens.js";

export const useSettingsRowStyles = makeStyles({
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    columnGap: "16px",
    paddingTop: "14px",
    paddingBottom: "14px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorBorderSoft,
  },
  meta: {
    minWidth: "0",
  },
  label: {
    fontSize: "13px",
    color: tokens.colorText,
  },
  hint: {
    fontSize: "11px",
    color: tokens.colorTextMuted,
    marginTop: "4px",
    lineHeight: "1.5",
  },
  control: {
    flexShrink: "0",
  },
});
