import { mergeClasses } from "@griffel/react";
import { type FC, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

import { DangerTab } from "~/components/danger-tab/DangerTab.js";
import { FlagsTab } from "~/components/flags-tab/FlagsTab.js";
import { LibraryTab } from "~/components/library-tab/LibraryTab.js";
import { MetadataTab } from "~/components/metadata-tab/MetadataTab.js";
import { TraceHistoryTab } from "~/components/trace-history-tab/TraceHistoryTab.js";

import { strings } from "./SettingsPage.strings.js";
import { useSettingsStyles } from "./SettingsPage.styles.js";

const SECTIONS = ["library", "metadata", "flags", "trace", "danger"] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, string> = {
  library: strings.sectionLibrary,
  metadata: strings.sectionMetadata,
  flags: strings.sectionFlags,
  trace: strings.sectionTrace,
  danger: strings.sectionDanger,
};

function isSection(value: string | null): value is Section {
  return SECTIONS.includes(value as Section);
}

export const SettingsPageContent: FC = () => {
  const styles = useSettingsStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSection = searchParams.get("section");
  const active: Section = isSection(rawSection) ? rawSection : "library";

  const setActive = (next: Section): void => {
    setSearchParams({ section: next }, { replace: true });
  };

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={mergeClasses("eyebrow", styles.navHeading)}>{strings.eyebrow}</div>
        {SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={mergeClasses(styles.navItem, active === id && styles.navItemActive)}
          >
            {SECTION_LABELS[id]}
          </button>
        ))}
      </nav>

      <div className={styles.body}>
        <div className={mergeClasses("eyebrow", styles.sectionEyebrow)}>
          · {SECTION_LABELS[active].toUpperCase()}
        </div>
        <div className={styles.sectionTitle}>{SECTION_LABELS[active]}</div>
        <div className={styles.sectionWrap}>
          {active === "library" && <LibraryTab />}
          {active === "metadata" && <MetadataTab />}
          {active === "flags" && <FlagsTab />}
          {active === "trace" && (
            <Suspense fallback={null}>
              <TraceHistoryTab />
            </Suspense>
          )}
          {active === "danger" && <DangerTab />}
        </div>
      </div>
    </div>
  );
};
