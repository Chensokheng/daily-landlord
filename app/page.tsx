"use client";

import { Receipt } from "lucide-react";
import { Home } from "@/components/app/home";
import { Onboarding } from "@/components/app/onboarding";
import { useApp } from "@/lib/store";

export default function Page() {
  const { ready, state } = useApp();

  // Brief splash while we read persisted state — avoids a flash of the
  // wrong screen on reload.
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper canvas-grid">
        <div className="grid size-16 animate-pulse place-items-center rounded-[1.3rem] bg-brand text-white ring-brand">
          <Receipt className="size-8" />
        </div>
      </div>
    );
  }

  return state.onboarded ? <Home /> : <Onboarding />;
}
