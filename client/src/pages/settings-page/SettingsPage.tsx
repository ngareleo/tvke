import { mergeClasses } from "@griffel/react";
import React, { type FC, useState } from "react";
import { graphql, useMutation } from "react-relay";

import type { SettingsPageScanMutation } from "~/relay/__generated__/SettingsPageScanMutation.graphql.js";
import type { SettingsPageSetKeyMutation } from "~/relay/__generated__/SettingsPageSetKeyMutation.graphql.js";

import { useSettingsStyles } from "./SettingsPage.styles.js";

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

type Tab = "library" | "metadata" | "danger";

const LibraryTab: FC = () => {
  const styles = useSettingsStyles();
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
  const styles = useSettingsStyles();
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
  const styles = useSettingsStyles();
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
  const styles = useSettingsStyles();
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
