"use client";

import * as React from "react";
import {
  type AppState,
  type Config,
  defaultState,
  type ExtraFee,
  type Tenant,
  type UtilityConfig,
} from "./types";

const STORAGE_KEY = "tally.v1";

type UtilityKey = "water" | "electricity";

interface AppContextValue {
  ready: boolean;
  state: AppState;
  updateProfile: (patch: Partial<Config["profile"]>) => void;
  updateUtility: (key: UtilityKey, patch: Partial<UtilityConfig>) => void;
  addExtra: (fee: Omit<ExtraFee, "id">) => void;
  removeExtra: (id: string) => void;
  /** Set or clear the landlord payment QR (pass "" to remove). */
  setPaymentQr: (dataUrl: string) => void;
  completeOnboarding: () => void;
  resetAll: () => void;
  addTenant: (t: Omit<Tenant, "id" | "createdAt">) => void;
}

const AppContext = React.createContext<AppContextValue | null>(null);

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<AppState>(defaultState);

  // Hydrate from localStorage on mount (client only).
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState({ ...defaultState, ...parsed });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist on every change once hydrated.
  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be full or blocked */
    }
  }, [state, ready]);

  const value = React.useMemo<AppContextValue>(
    () => ({
      ready,
      state,
      updateProfile: (patch) =>
        setState((s) => ({
          ...s,
          config: { ...s.config, profile: { ...s.config.profile, ...patch } },
        })),
      updateUtility: (key, patch) =>
        setState((s) => ({
          ...s,
          config: { ...s.config, [key]: { ...s.config[key], ...patch } },
        })),
      addExtra: (fee) =>
        setState((s) => ({
          ...s,
          config: {
            ...s.config,
            extras: [...s.config.extras, { ...fee, id: makeId() }],
          },
        })),
      removeExtra: (id) =>
        setState((s) => ({
          ...s,
          config: {
            ...s.config,
            extras: s.config.extras.filter((e) => e.id !== id),
          },
        })),
      setPaymentQr: (dataUrl) =>
        setState((s) => ({
          ...s,
          config: { ...s.config, paymentQr: dataUrl },
        })),
      completeOnboarding: () => setState((s) => ({ ...s, onboarded: true })),
      resetAll: () => setState(defaultState),
      addTenant: (t) =>
        setState((s) => ({
          ...s,
          tenants: [
            ...s.tenants,
            { ...t, id: makeId(), createdAt: Date.now() },
          ],
        })),
    }),
    [ready, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}
