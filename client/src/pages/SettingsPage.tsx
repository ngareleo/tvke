import { makeStyles, mergeClasses } from "@griffel/react";
import React, { type FC, useState } from "react";
import { graphql, useMutation } from "react-relay";

import type { SettingsPageScanMutation } from "~/relay/__generated__/SettingsPageScanMutation.graphql.js";
import type { SettingsPageSetKeyMutation } from "~/relay/__generated__/SettingsPageSetKeyMutation.graphql.js";
import { tokens } from "~/styles/tokens.js";

const SET_SETTING_MUTATION = graphql`
  mutation SettingsPageSetKeyMutation($key: String!, $value: String!) {
    setSetting(key: $key, value: $value)
  }
`;

const SCAN_MUTATION = graphql`
  mutation SettingsPageScanMutation {
    scanLibraries {
      id
    }
  }
`;

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${tokens.colorBorder}`,
    flexShrink: "0",
    backgroundColor: tokens.colorSurface,
  },
  tab: {
    padding: "0 18px",
    height: "44px",
    fontSize: "12px",
    fontWeight: "600",
    color: tokens.colorMuted,
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    transitionProperty: "color, border-color",
    transitionDuration: tokens.transition,
    ":hover": {
      color: tokens.colorWhite,
    },
  },
  tabActive: {
    color: tokens.colorWhite,
    borderBottom: `2px solid ${tokens.colorRed}`,
  },
  body: {
    flex: "1",
    overflowY: "auto",
    padding: "28px",
    maxWidth: "560px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: tokens.colorWhite,
    marginBottom: "4px",
  },
  sectionDesc: {
    fontSize: "12px",
    color: tokens.colorMuted,
    lineHeight: "1.6",
    marginBottom: "14px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorMuted2,
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    ":focus": {
      border: `1px solid ${tokens.colorRed}`,
    },
    "::placeholder": {
      color: tokens.colorMuted2,
    },
    boxSizing: "border-box",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: tokens.colorRed,
    border: `1px solid ${tokens.colorRed}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorRedDark,
    },
    ":disabled": {
      opacity: "0.5",
      cursor: "default",
    },
  },
  btnSecondary: {
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colorBorder}`,
    color: tokens.colorMuted,
    ":hover": {
      color: tokens.colorWhite,
      border: `1px solid ${tokens.colorBorder2}`,
      backgroundColor: "transparent",
    },
  },
  successMsg: {
    fontSize: "11px",
    color: tokens.colorGreen,
    marginTop: "8px",
  },
  dangerZone: {
    border: `1px solid rgba(206,17,38,0.3)`,
    borderRadius: tokens.radiusMd,
    padding: "16px",
    backgroundColor: "rgba(206,17,38,0.04)",
  },
  dangerTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: tokens.colorRed,
    marginBottom: "8px",
  },
  dangerDesc: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colorRedBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorRed,
    fontSize: "12px",
    fontWeight: "600",
    cursor: "not-allowed",
    opacity: "0.5",
  },
});

type Tab = "library" | "metadata" | "danger";

const LibraryTab: FC = () => {
  const styles = useStyles();
  const [scan, isPending] = useMutation<SettingsPageScanMutation>(SCAN_MUTATION);
  const [done, setDone] = useState(false);

  const handleScan = (): void => {
    setDone(false);
    scan({ variables: {}, onCompleted: () => setDone(true) });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Library Scan</div>
      <div className={styles.sectionDesc}>
        Trigger an immediate rescan of all configured library directories. New files will be added
        and missing files removed.
      </div>
      <button className={styles.btn} onClick={handleScan} disabled={isPending} type="button">
        {isPending ? "Scanning…" : "Scan Libraries"}
      </button>
      {done && <div className={styles.successMsg}>Scan triggered successfully.</div>}
    </div>
  );
};

const MetadataTab: FC = () => {
  const styles = useStyles();
  const [apiKey, setApiKey] = useState("");
  const [save, isPending] = useMutation<SettingsPageSetKeyMutation>(SET_SETTING_MUTATION);
  const [saved, setSaved] = useState(false);

  const handleSave = (): void => {
    setSaved(false);
    save({
      variables: { key: "omdbApiKey", value: apiKey },
      onCompleted: () => setSaved(true),
    });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>OMDb API Key</div>
      <div className={styles.sectionDesc}>
        Used for automatic movie metadata matching (title, poster, rating, plot). Free tier allows
        1,000 requests per day. Get your key at omdbapi.com.
      </div>
      <label className={styles.label} htmlFor="omdb-key">
        API Key
      </label>
      <input
        id="omdb-key"
        className={styles.input}
        type="password"
        placeholder="e.g. abc12345"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        autoComplete="off"
      />
      <button
        className={styles.btn}
        onClick={handleSave}
        disabled={isPending || !apiKey}
        type="button"
      >
        {isPending ? "Saving…" : "Save Key"}
      </button>
      {saved && <div className={styles.successMsg}>API key saved.</div>}
    </div>
  );
};

const DangerTab: FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.section}>
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>Danger Zone</div>
        <div className={styles.dangerDesc}>
          Delete all matched metadata. Videos will become unmatched and need to be re-linked. This
          cannot be undone.
        </div>
        <button className={styles.btnDanger} disabled type="button">
          Delete All Metadata (coming soon)
        </button>
      </div>
    </div>
  );
};

export const SettingsPage: FC = () => {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<Tab>("library");

  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        {(["library", "metadata", "danger"] as Tab[]).map((t) => (
          <button
            key={t}
            className={mergeClasses(styles.tab, activeTab === t && styles.tabActive)}
            onClick={() => setActiveTab(t)}
            type="button"
          >
            {t === "library" ? "Library" : t === "metadata" ? "Metadata" : "Danger Zone"}
          </button>
        ))}
      </div>
      <div className={styles.body}>
        {activeTab === "library" && <LibraryTab />}
        {activeTab === "metadata" && <MetadataTab />}
        {activeTab === "danger" && <DangerTab />}
      </div>
    </div>
  );
};
