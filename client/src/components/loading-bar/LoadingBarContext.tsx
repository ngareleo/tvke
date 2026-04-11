/**
 * LoadingBarContext — shared loading state between pages and the LoadingBar.
 *
 * Pages call `usePageLoading(loading)` to signal that data is being fetched.
 * The LoadingBar component (rendered once in AppShell) reads `isLoading` and
 * drives its animation state machine.
 *
 * Multiple pages can signal loading simultaneously (e.g. during tab switches
 * before the previous page unmounts). The context counts active loaders so the
 * bar stays visible until all loaders have resolved.
 */

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
import { useNavigation } from "react-router-dom";

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

/**
 * Renders nothing but bridges React Router's navigation state into the
 * LoadingBar. Mount once inside LoadingBarProvider (AppShell does this).
 * Route transitions automatically show the loading bar without any
 * per-page usePageLoading() calls.
 */
export const RouterNavigationLoader: FC = () => {
  const { state } = useNavigation();
  usePageLoading(state === "loading");
  return null;
};
