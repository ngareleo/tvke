import { useMemo, useRef } from "react";
import { graphql, useSubscription } from "react-relay";

import type { useLibraryScanSubscriptionQuery } from "~/relay/__generated__/useLibraryScanSubscriptionQuery.graphql.js";

const SCAN_SUBSCRIPTION = graphql`
  subscription useLibraryScanSubscriptionQuery {
    libraryScanProgress {
      scanning
      libraryId
      done
      total
      phase
      currentItem
    }
  }
`;

export interface LibraryScanSnapshot {
  scanning: boolean;
  libraryId: string | null;
  done: number | null;
  total: number | null;
  phase: string | null;
  currentItem: string | null;
}

/**
 * Subscribe to libraryScanProgress and call `onUpdate` on every snapshot.
 * The server emits an initial frame on subscribe (so on mount you learn
 * whatever scan is already in flight) plus one frame per state change.
 *
 * Pass a stable callback (e.g. via useCallback) to avoid re-subscribing.
 */
export function useLibraryScanSubscription(onUpdate: (snap: LibraryScanSnapshot) => void): void {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const config = useMemo(
    () => ({
      subscription: SCAN_SUBSCRIPTION,
      variables: {},
      onNext: (response: useLibraryScanSubscriptionQuery["response"] | null | undefined) => {
        const snap = response?.libraryScanProgress;
        if (!snap) return;
        onUpdateRef.current({
          scanning: snap.scanning,
          libraryId: snap.libraryId ?? null,
          done: snap.done ?? null,
          total: snap.total ?? null,
          phase: snap.phase ?? null,
          currentItem: snap.currentItem ?? null,
        });
      },
      onError: () => {},
    }),
    []
  );

  useSubscription<useLibraryScanSubscriptionQuery>(config);
}
