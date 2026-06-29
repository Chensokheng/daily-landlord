"use client";

import { Receipt } from "lucide-react";
import type * as React from "react";
import { useOnboarded } from "@/hooks/use-config";
import { useHydrated } from "@/lib/store";
import { Onboarding } from "./onboarding";

/**
 * Wraps every route: shows a splash until the persisted store rehydrates, then
 * forces onboarding until it's complete. Once onboarded, renders the page.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useOnboarded();

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper canvas-grid">
        <div className="grid size-16 animate-pulse place-items-center rounded-[1.3rem] bg-brand text-white ring-brand">
          <Receipt className="size-8" />
        </div>
      </div>
    );
  }

  if (!onboarded) return <Onboarding />;

  return <>{children}</>;
}
