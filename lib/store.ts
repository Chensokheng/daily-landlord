import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { formatInvoiceNumber } from "./invoice";
import { type AppState, defaultState, type Invoice } from "./types";

export const STORAGE_KEY = "tally.v1";

/**
 * Single source of truth, persisted to localStorage by zustand. The store
 * holds *data only* — all reads/writes go through the `service/` layer, which
 * is in turn exposed to components through the React Query hooks in `hooks/`.
 */
export const useAppStore = create<AppState>()(
  persist(() => ({ ...defaultState }), {
    name: STORAGE_KEY,
    version: 2,
    storage: createJSONStorage(() => localStorage),
    // Rehydrate manually in `useHydrated` so the server never touches localStorage.
    skipHydration: true,
    // v1 invoices predate the `number` field — backfill sequential numbers in
    // creation order (oldest first) so older invoices stay searchable too.
    migrate: (persisted, version) => {
      const s = (persisted ?? {}) as Partial<AppState>;
      if (version < 2 && Array.isArray(s.invoices)) {
        const order = [...s.invoices].sort((a, b) => a.createdAt - b.createdAt);
        const byId = new Map<string, string>();
        order.forEach((inv, i) => {
          byId.set(inv.id, formatInvoiceNumber(i + 1));
        });
        s.invoices = s.invoices.map((inv: Invoice) => ({
          ...inv,
          number: inv.number || (byId.get(inv.id) ?? ""),
        }));
      }
      return s as AppState;
    },
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
