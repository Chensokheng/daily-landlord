import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type AppState, defaultState } from "./types";

export const STORAGE_KEY = "tally.v1";

/**
 * Single source of truth, persisted to localStorage by zustand. The store
 * holds *data only* — all reads/writes go through the `service/` layer, which
 * is in turn exposed to components through the React Query hooks in `hooks/`.
 */
export const useAppStore = create<AppState>()(
  persist(() => ({ ...defaultState }), {
    name: STORAGE_KEY,
    version: 1,
    storage: createJSONStorage(() => localStorage),
    // Rehydrate manually in `useHydrated` so the server never touches localStorage.
    skipHydration: true,
    // Deep-merge config so snapshots from older builds gain new default fields.
    merge: (persisted, current) => {
      const p = (persisted ?? {}) as Partial<AppState>;
      return {
        ...current,
        ...p,
        config: { ...current.config, ...(p.config ?? {}) },
      };
    },
  }),
);

/** True once the store has rehydrated from localStorage (client only). */
export function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    useAppStore.persist.rehydrate();
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

// Re-exported for the components that import it from the store.
export { formatUSD } from "./utils";
