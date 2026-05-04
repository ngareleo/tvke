import { mergeClasses } from "@griffel/react";
import { useNovaEventing } from "@nova/react";
import {
  type FC,
  Fragment,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";

import { IconFolder } from "~/lib/icons.js";
import type {
  DirectoryBrowserQuery,
  DirectoryBrowserQuery$data,
} from "~/relay/__generated__/DirectoryBrowserQuery.graphql.js";

import {
  createDirectoryBrowserCancelledEvent,
  createDirectorySelectedEvent,
} from "./DirectoryBrowser.events.js";
import { strings } from "./DirectoryBrowser.strings.js";
import { useDirectoryBrowserStyles } from "./DirectoryBrowser.styles.js";

const DIRECTORY_QUERY = graphql`
  query DirectoryBrowserQuery($path: String!) {
    listDirectory(path: $path) {
      name
      path
    }
  }
`;

type DirectoryEntry = DirectoryBrowserQuery$data["listDirectory"][number];

interface DirectoryBrowserProps {
  initialPath?: string;
}

function parentPath(path: string): string {
  if (path === "/" || path === "") return "/";
  const parent = path.replace(/\/?[^/]+$/, "");
  return parent || "/";
}

interface Crumb {
  label: string;
  path: string;
}

function buildCrumbs(path: string): Crumb[] {
  if (path === "/" || path === "") return [{ label: "/", path: "/" }];
  const parts = path.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "/", path: "/" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({ label: part, path: acc });
  }
  return crumbs;
}

export const DirectoryBrowser: FC<DirectoryBrowserProps> = ({ initialPath = "/" }) => {
  const styles = useDirectoryBrowserStyles();
  const environment = useRelayEnvironment();
  const { bubble } = useNovaEventing();

  const handleCancel = (e: MouseEvent<HTMLButtonElement>): void => {
    void bubble({ reactEvent: e, event: createDirectoryBrowserCancelledEvent() });
  };

  const handleSelect = (e: MouseEvent<HTMLButtonElement>): void => {
    void bubble({ reactEvent: e, event: createDirectorySelectedEvent(path) });
  };

  const [path, setPath] = useState<string>(initialPath || "/");
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useCallback(
    (next: string): void => {
      setPath(next);
      setLoading(true);
      fetchQuery<DirectoryBrowserQuery>(environment, DIRECTORY_QUERY, { path: next }).subscribe({
        next: (data) => {
          setEntries([...(data.listDirectory ?? [])]);
          setLoading(false);
        },
        error: () => setLoading(false),
      });
    },
    [environment]
  );

  useEffect(() => {
    navigate(initialPath || "/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crumbs = useMemo(() => buildCrumbs(path), [path]);

  return (
    <div className={styles.panel} role="dialog" aria-label={strings.a11yLabel}>
      <div className={styles.breadcrumb}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={c.path}>
              {i > 0 && <span className={styles.crumbSep}>/</span>}
              <button
                type="button"
                className={mergeClasses(styles.crumbBtn, last && styles.crumbCurrent)}
                onClick={() => navigate(c.path)}
              >
                {c.label}
              </button>
            </Fragment>
          );
        })}
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>{strings.loading}</div>
        ) : (
          <>
            {path !== "/" && (
              <button
                type="button"
                className={mergeClasses(styles.entry, styles.entryUp)}
                onClick={() => navigate(parentPath(path))}
              >
                <span className={styles.entryIcon} aria-hidden="true">
                  ↑
                </span>
                {strings.up}
              </button>
            )}
            {entries.length === 0 ? (
              <div className={styles.empty}>{strings.empty}</div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  className={styles.entry}
                  onClick={() => navigate(entry.path)}
                >
                  <span className={styles.entryIcon} aria-hidden="true">
                    <IconFolder />
                  </span>
                  {entry.name}
                </button>
              ))
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        <span className={styles.actionsHint} title={path}>
          {path}
        </span>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          {strings.cancel}
        </button>
        <button type="button" className={styles.selectBtn} onClick={handleSelect}>
          {strings.select}
        </button>
      </div>
    </div>
  );
};
