import { mergeClasses } from "@griffel/react";
import { useNovaEventing } from "@nova/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import type { DirectoryBrowser_query$key } from "~/relay/__generated__/DirectoryBrowser_query.graphql.js";
import type { DirectoryBrowserRefetchQuery } from "~/relay/__generated__/DirectoryBrowserRefetchQuery.graphql.js";

import { createFolderSelectedEvent } from "./DirectoryBrowser.events.js";
import { strings } from "./DirectoryBrowser.strings.js";
import { useDirectoryBrowserStyles } from "./DirectoryBrowser.styles.js";

const DIRECTORY_FRAGMENT = graphql`
  fragment DirectoryBrowser_query on Query
  @refetchable(queryName: "DirectoryBrowserRefetchQuery")
  @argumentDefinitions(path: { type: "String!" }) {
    listDirectory(path: $path) {
      name
      path
    }
  }
`;

interface Props {
  queryRef: DirectoryBrowser_query$key;
  initialPath: string;
}

export const DirectoryBrowser: FC<Props> = ({ queryRef, initialPath }) => {
  const styles = useDirectoryBrowserStyles();
  const { bubble } = useNovaEventing();

  const [data, refetch] = useRefetchableFragment<
    DirectoryBrowserRefetchQuery,
    DirectoryBrowser_query$key
  >(DIRECTORY_FRAGMENT, queryRef);

  const [browsePath, setBrowsePath] = useState(initialPath || "/");
  const [loading, setLoading] = useState(false);
  const initialised = useRef(false);

  const navigate = useCallback(
    (path: string): void => {
      setBrowsePath(path);
      setLoading(true);
      refetch({ path }, { onComplete: () => setLoading(false) });
    },
    [refetch]
  );

  // On first mount, load the actual initial path (the parent query starts at "/")
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      const target = initialPath || "/";
      if (target !== "/") {
        navigate(target);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = data.listDirectory ?? [];

  const navigateUp = (): void => {
    const parent = browsePath.replace(/\/?[^/]+$/, "") || "/";
    navigate(parent);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.breadcrumb}>{browsePath}</div>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>{strings.loading}</div>
        ) : (
          <>
            {browsePath !== "/" && (
              <button
                className={mergeClasses(styles.entry, styles.entryUp)}
                onClick={navigateUp}
                type="button"
              >
                {strings.up}
              </button>
            )}
            {entries.length === 0 ? (
              <div className={styles.empty}>{strings.empty}</div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.path}
                  className={styles.entry}
                  onClick={() => navigate(entry.path)}
                  type="button"
                >
                  📁 {entry.name}
                </button>
              ))
            )}
          </>
        )}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.selectBtn}
          onClick={(e) => {
            void bubble({ reactEvent: e, event: createFolderSelectedEvent(browsePath) });
          }}
          type="button"
        >
          {strings.selectFolder}
        </button>
      </div>
    </div>
  );
};
