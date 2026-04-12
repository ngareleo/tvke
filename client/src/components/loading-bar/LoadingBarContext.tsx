import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface LoadingBarCtx {
  isLoading: boolean;
  setLoading: (id: string, loading: boolean) => void;
}

const Ctx = createContext<LoadingBarCtx>({ isLoading: false, setLoading: () => {} });

export const LoadingBarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Map of loader-id → boolean. The bar is active when any entry is true.
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});

  // Stable reference — usePageLoading has this in its dep array
  const setLoading = useCallback((id: string, loading: boolean) => {
    setLoaders((prev) => ({ ...prev, [id]: loading }));
  }, []);

  const isLoading = Object.values(loaders).some(Boolean);

  return <Ctx.Provider value={{ isLoading, setLoading }}>{children}</Ctx.Provider>;
};

/**
 * Call at the top of any page component. While `loading` is true the global
 * loading bar is shown. Automatically unregisters on unmount.
 */
export function usePageLoading(loading: boolean): void {
  const id = useId();
  const { setLoading } = useContext(Ctx);

  // Keep a ref so the cleanup closure always sees the current id
  const idRef = useRef(id);

  useEffect(() => {
    const stableId = idRef.current;
    setLoading(stableId, loading);
    return () => setLoading(stableId, false);
  }, [loading, setLoading]);
}

export function useLoadingBarState(): boolean {
  return useContext(Ctx).isLoading;
}
