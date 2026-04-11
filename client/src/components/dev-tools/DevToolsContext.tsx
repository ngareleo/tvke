/**
 * DevToolsContext — shared state for the dev kill switch.
 *
 * Usage:
 *   // Wrap any subtree you want to be throwable from DevPanel:
 *   <DevThrowTarget id="Dashboard">
 *     <DashboardPageContent />
 *   </DevThrowTarget>
 *
 *   // DevPanel lists all registered targets. Clicking "⚡ Throw" on one
 *   // causes that DevThrowTarget to throw, triggering the nearest ErrorBoundary.
 */

import {
  createContext,
  type FC,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";

interface DevToolsCtx {
  /** Ref holding the active throw target id (or null). Mutation is safe during render. */
  throwTargetRef: MutableRefObject<string | null>;
  setThrowTarget: (id: string | null) => void;
}

const Ctx = createContext<DevToolsCtx>({
  throwTargetRef: { current: null },
  setThrowTarget: () => {},
});

export const DevToolsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const throwTargetRef = useRef<string | null>(null);
  // A plain counter state used only to trigger re-renders when the ref changes.
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  const setThrowTarget = useCallback((id: string | null) => {
    throwTargetRef.current = id;
    rerender();
  }, []);

  return <Ctx.Provider value={{ throwTargetRef, setThrowTarget }}>{children}</Ctx.Provider>;
};

export function useDevTools(): DevToolsCtx {
  return useContext(Ctx);
}

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
