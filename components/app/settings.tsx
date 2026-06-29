"use client";

import { ArrowLeft, Info, RotateCcw } from "lucide-react";
import type * as React from "react";
import { useConfigActions } from "@/hooks/use-config";
import {
  ExtrasFields,
  PaymentQrField,
  ProfileFields,
  UtilityFields,
} from "./onboarding";
import { MobileFrame } from "./ui";

export function Settings({ onBack }: { onBack: () => void }) {
  const { resetAll } = useConfigActions();

  const reset = () => {
    if (
      confirm(
        "Reset everything — tenants, invoices and settings — and start setup again? This can't be undone.",
      )
    ) {
      resetAll();
    }
  };

  return (
    <MobileFrame>
      <header className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.3rem] font-bold tracking-tight text-ink">
          Settings
        </h1>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-6 pt-3 pb-8">
        {/* How edits relate to existing invoices */}
        <div className="flex gap-3 rounded-2xl border border-line bg-surface p-3.5 ring-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <p className="text-[0.85rem] leading-relaxed text-ink-soft">
            New rates apply to{" "}
            <span className="font-medium text-ink">future invoices only</span>.
            Existing invoices keep the rates they were generated with — delete
            and regenerate one to apply changes. Your payment QR and name show
            live on every invoice.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <Section title="About you">
            <ProfileFields />
          </Section>
          <Section title="Water & electricity">
            <UtilityFields />
          </Section>
          <Section title="Other charges">
            <ExtrasFields />
          </Section>
          <Section title="Payment QR">
            <PaymentQrField />
          </Section>
        </div>

        {/* Danger zone */}
        <div className="mt-10 border-t border-line pt-6">
          <h3 className="mb-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-faint uppercase">
            Danger zone
          </h3>
          <button
            type="button"
            onClick={reset}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 py-3 text-[0.9rem] font-medium text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="size-4" />
            Reset everything
          </button>
          <p className="mt-2.5 text-center text-[0.8rem] text-faint">
            Clears all tenants, invoices and settings on this device.
          </p>
        </div>
      </main>
    </MobileFrame>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-faint uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
