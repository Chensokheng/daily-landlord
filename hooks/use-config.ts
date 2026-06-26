"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAppStore } from "@/lib/store";
import * as svc from "@/service/config.service";

/** Reactive config read straight from the persisted store (sync, no fetch). */
export function useConfig() {
  return useAppStore((s) => s.config);
}

export function useOnboarded() {
  return useAppStore((s) => s.onboarded);
}

/** Config mutations. These are app settings, edited live — so they write to the
 * store directly rather than going through React Query's async cache. */
export function useConfigActions() {
  const qc = useQueryClient();
  return React.useMemo(
    () => ({
      updateProfile: svc.updateProfile,
      updateUtility: svc.updateUtility,
      addExtra: svc.addExtra,
      removeExtra: svc.removeExtra,
      setPaymentQr: svc.setPaymentQr,
      completeOnboarding: svc.completeOnboarding,
      resetAll: () => {
        svc.resetAll();
        qc.clear(); // drop cached tenants/invoices after a full reset
      },
    }),
    [qc],
  );
}
