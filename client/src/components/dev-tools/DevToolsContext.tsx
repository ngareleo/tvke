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
