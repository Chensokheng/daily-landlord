"use client";

import { ArrowLeft, Gauge, Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { useInvoices } from "@/hooks/use-invoices";
import { useTenants } from "@/hooks/use-tenants";
import { billingTodos } from "@/lib/due";
import { useT } from "@/lib/i18n";
import { BillTodoRow, billUrgency, type Urgency } from "./bill-todo";
import type { InvoiceSeed } from "./invoices";
import { MobileFrame } from "./ui";

const GROUPS: { key: Urgency; label: string; dot: string }[] = [
  { key: "overdue", label: "Overdue", dot: "bg-destructive" },
  { key: "soon", label: "Due soon", dot: "bg-amber-500" },
  { key: "upcoming", label: "Upcoming", dot: "bg-brand" },
];

export function Billing({
  onBack,
  onNewInvoice,
}: {
  onBack: () => void;
  onNewInvoice: (seed?: InvoiceSeed) => void;
}) {
  const { data: tenants = [] } = useTenants();
  const { data: invoices = [] } = useInvoices();
  const t = useT();
  const [query, setQuery] = React.useState("");

  const now = Date.now();
  const todos = billingTodos(tenants, invoices, now);

  const q = query.trim().toLowerCase();
  const shown = todos.filter(({ tenant }) => {
    if (!q) return true;
    return (
      tenant.name.toLowerCase().includes(q) ||
      tenant.unit.toLowerCase().includes(q) ||
      tenant.phone.toLowerCase().includes(q)
    );
  });

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: shown.filter((t) => billUrgency(t.daysUntilDue) === g.key),
  })).filter((g) => g.items.length > 0);

  return (
    <MobileFrame>
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex w-full max-w-[460px] items-center gap-3 border-b border-line bg-paper/85 px-6 pt-6 pb-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
          aria-label={t("Back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.3rem] font-bold tracking-tight text-ink">
          {t("To bill")}
        </h1>
        {todos.length > 0 && (
          <span className="nums ml-auto rounded-full bg-secondary px-2.5 py-1 text-[0.8rem] font-medium text-ink-soft">
            {todos.length}
          </span>
        )}
      </header>

      <div className="px-6 pt-24 pb-1">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
          <Input
            className="pl-11"
            placeholder={t("Search name, unit or phone")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-6 pt-3 pb-6">
        {shown.length === 0 ? (
          <EmptyState hasTodos={todos.length > 0} t={t} />
        ) : (
          <div className="space-y-5">
            {grouped.map((g) => (
              <section key={g.key}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={`size-1.5 rounded-full ${g.dot}`} />
                  <h2 className="text-[0.78rem] font-semibold tracking-wide text-ink-soft uppercase">
                    {t(g.label)}
                  </h2>
                  <span className="nums text-[0.78rem] text-faint">
                    {g.items.length}
                  </span>
                </div>
                <ul className="overflow-hidden rounded-3xl border border-line bg-surface ring-card">
                  {g.items.map(({ tenant, monthKey, daysUntilDue }) => (
                    <BillTodoRow
                      key={tenant.id}
                      tenant={tenant}
                      monthKey={monthKey}
                      daysUntilDue={daysUntilDue}
                      onGenerate={(t, mk) =>
                        onNewInvoice({ tenantId: t.id, periodKey: mk })
                      }
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </MobileFrame>
  );
}

function EmptyState({
  hasTodos,
  t,
}: {
  hasTodos: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
      <div className="grid size-16 place-items-center rounded-[1.3rem] border border-line bg-surface text-brand ring-card">
        <Gauge className="size-7" />
      </div>
      <h2 className="mt-5 font-display text-[1.4rem] font-bold tracking-tight text-ink">
        {hasTodos ? t("No matches") : t("All caught up")}
      </h2>
      <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-relaxed text-ink-soft">
        {hasTodos
          ? t("Try a different search.")
          : t("Every tenant due this cycle has been billed. Nice work.")}
      </p>
    </div>
  );
}
