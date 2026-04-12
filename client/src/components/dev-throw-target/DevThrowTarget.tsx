import { type FC, type ReactNode } from "react";

import { useDevTools } from "~/components/dev-tools/DevToolsContext.js";

/**
 * Wrap any component subtree with this to make it throwable from the DevPanel.
 * When `throwTarget` matches `id`, this component throws a descriptive error
 * that the nearest ErrorBoundary will catch.
 */
export const DevThrowTarget: FC<{ id: string; children: ReactNode }> = ({ id, children }) => {
  const { throwTargetRef } = useDevTools();

  if (throwTargetRef.current === id) {
    // Mutate the ref (not setState) — safe during render, no React warning.
    throwTargetRef.current = null;
    throw new Error(
      `[DevTools] Force-thrown in: ${id}\n\nThis error was triggered by the DevPanel kill switch. ` +
        `It simulates a render crash in the "${id}" component tree.`
    );
  }

  return <>{children}</>;
};
