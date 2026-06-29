import { SCHEMA_VERSION, STORAGE_KEY, useAppStore } from "@/lib/store";
import type { AppState } from "@/lib/types";

/** A self-describing snapshot of everything Tally stores on this device. */
export interface TallyBackup {
  app: "tally";
  /** localStorage key the data lives under, for reference. */
  storageKey: string;
  /** Persisted-state schema version, so a future import can migrate it. */
  schemaVersion: number;
  /** ISO timestamp the export was taken. */
  exportedAt: string;
  data: AppState;
}

/** Gather the full app state into a portable, self-describing backup object. */
export function buildBackup(): TallyBackup {
  const { onboarded, lang, config, tenants, invoices } = useAppStore.getState();
  return {
    app: "tally",
    storageKey: STORAGE_KEY,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { onboarded, lang, config, tenants, invoices },
  };
}
