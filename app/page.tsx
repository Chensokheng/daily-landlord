"use client";

import { Receipt } from "lucide-react";
import * as React from "react";
import { Home } from "@/components/app/home";
import { Invoices } from "@/components/app/invoices";
import { Onboarding } from "@/components/app/onboarding";
import { Tenants } from "@/components/app/tenants";
import { useOnboarded } from "@/hooks/use-config";
import { useHydrated } from "@/lib/store";

type Screen = "home" | "tenants" | "invoices";

export default function Page() {
  const hydrated = useHydrated();
  const onboarded = useOnboarded();
  const [screen, setScreen] = React.useState<Screen>("home");
  const [invoiceMode, setInvoiceMode] = React.useState<"list" | "build">(
    "list",
  );

  // Brief splash while we read persisted state — avoids a flash of the
  // wrong screen on reload.
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

  if (screen === "tenants") {
    return <Tenants onBack={() => setScreen("home")} />;
  }

  if (screen === "invoices") {
    return (
      <Invoices initialMode={invoiceMode} onBack={() => setScreen("home")} />
    );
  }

  return (
    <Home
      onOpenTenants={() => setScreen("tenants")}
      onNewInvoice={() => {
        setInvoiceMode("build");
        setScreen("invoices");
      }}
      onOpenInvoices={() => {
        setInvoiceMode("list");
        setScreen("invoices");
      }}
    />
  );
}
