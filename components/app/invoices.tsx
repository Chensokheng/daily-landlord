

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Droplets,
  FileText,
  Pencil,
  Receipt,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
  Users,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/use-config";
import {
  invoiceKeys,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoices,
  useSetInvoicePaid,
} from "@/hooks/use-invoices";
import { useTenants } from "@/hooks/use-tenants";
import {
  currentMonthKey,
  defaultDueDate,
  invoiceStatus,
  monthKeyAnchor,
  monthKeyToLabel,
  parseDueTs,
  statusLabel,
} from "@/lib/due";
import { useT } from "@/lib/i18n";
import {
  computeInvoice,
  type InvoiceDraft,
  previousReadings,
} from "@/lib/invoice";
import { seedMockInvoices } from "@/lib/seed";
import type { Invoice, LandlordProfile, Tenant } from "@/lib/types";
import { cn, formatQty, formatUSD } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  Field,
  MobileFrame,
  Segmented,
  Sheet,
  Switch,
} from "./ui";

const IS_DEV = process.env.NODE_ENV !== "production";

export interface InvoiceSeed {
  tenantId?: string;
  periodKey?: string;
}

/* ------------------------------------------------------------------ */
/* List                                                               */
/* ------------------------------------------------------------------ */

export function InvoiceList({
  onBack,
  onNew,
  onOpen,
  tenantId,
  onClearTenant,
}: {
  onBack: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  tenantId?: string;
  onClearTenant?: () => void;
}) {
  const { data: invoices = [] } = useInvoices();
  const { data: tenants = [] } = useTenants();
  const t = useT();
  const hasTenants = tenants.length > 0;
  const now = Date.now();
  const qc = useQueryClient();

  const seed = () => {
    seedMockInvoices();
    qc.invalidateQueries({ queryKey: invoiceKeys.all });
  };

  // Invoices for the tenant filter (if any), used as the working set.
  const scoped = tenantId
    ? invoices.filter((i) => i.tenantId === tenantId)
    : invoices;
  const filterName = tenantId
    ? (scoped[0]?.tenantName ??
      tenants.find((t) => t.id === tenantId)?.name ??
      "tenant")
    : null;

  const thisMonth = currentMonthKey(now);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "unpaid" | "paid">("all");
  // Default to the current month, but show a tenant's full history when scoped.
  const [month, setMonth] = React.useState<string>(
    tenantId ? "all" : thisMonth,
  );

  // Distinct billing months present (always including this month), newest
  // first — drives the month chips.
  const months = [...new Set([thisMonth, ...scoped.map((i) => i.periodKey)])]
    .sort()
    .reverse();

  const q = query.trim().toLowerCase();
  const shown = scoped.filter((inv) => {
    if (filter === "paid" && inv.paidAt === null) return false;
    if (filter === "unpaid" && inv.paidAt !== null) return false;
    if (month !== "all" && inv.periodKey !== month) return false;
    if (!q) return true;
    return (
      inv.tenantName.toLowerCase().includes(q) ||
      inv.tenantUnit.toLowerCase().includes(q)
    );
  });

  // Group the filtered invoices by billing month, newest month first.
  const groupKeys = [...new Set(shown.map((i) => i.periodKey))]
    .sort()
    .reverse();
  const groups = groupKeys.map((key) => {
    const items = shown.filter((i) => i.periodKey === key);
    return {
      key,
      label: items[0].periodLabel,
      items,
      total: items.reduce((sum, i) => sum + i.total, 0),
    };
  });

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
          {t("Invoices")}
        </h1>
        {scoped.length > 0 && (
          <span className="nums ml-auto rounded-full bg-secondary px-2.5 py-1 text-[0.8rem] font-medium text-ink-soft">
            {scoped.length}
          </span>
        )}
      </header>

      {(tenantId || scoped.length > 0) && (
        <div className="space-y-3 px-6 pt-24 pb-1">
          {tenantId && (
            <button
              type="button"
              onClick={onClearTenant}
              className="pressable flex w-full items-center gap-2 rounded-2xl border border-brand/30 bg-brand-wash px-4 py-2.5 text-left"
            >
              <span className="text-[0.85rem] text-ink-soft">
                {t("Invoices for")}{" "}
                <span className="font-semibold text-brand-ink">
                  {filterName}
                </span>
              </span>
              <X className="ml-auto size-4 shrink-0 text-brand-ink" />
            </button>
          )}
          {scoped.length > 0 && (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
                <Input
                  className="pl-11"
                  placeholder={t("Search tenant or unit")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Segmented<"all" | "unpaid" | "paid">
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("All") },
                  { value: "unpaid", label: t("Unpaid") },
                  { value: "paid", label: t("Paid") },
                ]}
              />
              {months.length > 1 && (
                <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <MonthChip
                    active={month === "all"}
                    onClick={() => setMonth("all")}
                  >
                    {t("All months")}
                  </MonthChip>
                  {months.map((k) => (
                    <MonthChip
                      key={k}
                      active={month === k}
                      onClick={() => setMonth(k)}
                    >
                      {monthKeyToLabel(k)}
                    </MonthChip>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <main
        className={cn(
          "flex flex-1 flex-col overflow-y-auto px-6 pb-28",
          tenantId || scoped.length > 0 ? "pt-3" : "pt-24",
        )}
      >
        {scoped.length === 0 ? (
          <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-[1.3rem] border border-line bg-surface text-brand ring-card">
              <Receipt className="size-7" />
            </div>
            <h2 className="mt-5 font-display text-[1.4rem] font-bold tracking-tight text-ink">
              {t("No invoices yet")}
            </h2>
            <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-relaxed text-ink-soft">
              {tenantId
                ? t("{name} has no invoices yet.", { name: filterName ?? "" })
                : hasTenants
                  ? t(
                    "Punch in this month's meter readings and Tally builds the invoice for you.",
                  )
                  : t(
                    "Add a tenant first — then you can generate their invoice here.",
                  )}
            </p>
          </div>
        ) : shown.length === 0 ? (
          <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-[1.3rem] border border-line bg-surface text-faint ring-card">
              <Search className="size-7" />
            </div>
            <h2 className="mt-5 font-display text-[1.4rem] font-bold tracking-tight text-ink">
              {t("No matches")}
            </h2>
            <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-relaxed text-ink-soft">
              {t("Try a different search or filter.")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <section key={g.key}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h2 className="text-[0.78rem] font-semibold tracking-wide text-ink-soft uppercase">
                    {g.label}
                  </h2>
                  <span className="nums text-[0.78rem] text-faint">
                    {g.items.length}
                  </span>
                  <span className="nums ml-auto font-mono text-[0.82rem] font-semibold text-ink-soft">
                    {formatUSD(g.total)}
                  </span>
                </div>
                <ul className="space-y-3">
                  {g.items.map((inv) => (
                    <li key={inv.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(inv.id)}
                        className="pressable flex w-full items-center gap-3.5 rounded-3xl border border-line bg-surface p-4 text-left ring-card hover:border-line2"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-wash text-brand-ink">
                          <FileText className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-[1.05rem] font-semibold text-ink">
                            {inv.tenantName}
                          </p>
                          <p className="text-[0.84rem] text-faint">
                            {inv.tenantUnit
                              ? inv.tenantUnit
                              : `Issued ${formatDate(inv.createdAt)}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="nums font-mono text-[1.05rem] font-semibold text-ink">
                            {formatUSD(inv.total)}
                          </span>
                          <StatusBadge invoice={inv} now={now} />
                        </div>
                        <ChevronRight className="size-4 text-faint" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {hasTenants && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[460px] space-y-2 border-t border-line bg-paper/85 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Btn full onClick={onNew}>
            <Receipt className="size-5" />
            {t("New invoice")}
          </Btn>
          {IS_DEV && (
            <button
              type="button"
              onClick={seed}
              className="pressable w-full rounded-xl py-2 text-[0.8rem] font-medium text-faint hover:text-ink"
            >
              Seed mock invoices (dev)
            </button>
          )}
        </div>
      )}
    </MobileFrame>
  );
}

function MonthChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable shrink-0 rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand bg-brand-wash text-brand-ink"
          : "border-line bg-surface text-ink-soft hover:border-line2",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Builder                                                            */
/* ------------------------------------------------------------------ */

export function InvoiceBuilder({
  seed,
  onCancel,
  onSaved,
  onOpenInvoice,
}: {
  seed?: InvoiceSeed;
  onCancel: () => void;
  onSaved: (inv: Invoice) => void;
  onOpenInvoice: (id: string) => void;
}) {
  const config = useConfig();
  const { data: tenants = [] } = useTenants();
  const { data: invoices = [] } = useInvoices();
  const createInvoice = useCreateInvoice();
  const t = useT();

  const [step, setStep] = React.useState<"form" | "preview">("form");
  // Land at the top whenever the builder opens or swaps form ⇄ preview.
  // The frame scrolls at the window level (min-h-dvh, not a fixed height),
  // so reset the window — not an inner container.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);
  const [tenantId, setTenantId] = React.useState(
    seed?.tenantId ?? tenants[0]?.id ?? "",
  );
  const [periodKey, setPeriodKey] = React.useState(
    seed?.periodKey ?? currentMonthKey(Date.now()),
  );
  const [dueDate, setDueDate] = React.useState("");
  const [includeRent, setIncludeRent] = React.useState(true);
  const [excludedExtras, setExcludedExtras] = React.useState<string[]>([]);
  const toggleExtra = (id: string) =>
    setExcludedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const [waterPrev, setWaterPrev] = React.useState(0);
  const [waterCur, setWaterCur] = React.useState(0);
  const [elecPrev, setElecPrev] = React.useState(0);
  const [elecCur, setElecCur] = React.useState(0);

  const tenant = tenants.find((t) => t.id === tenantId) ?? tenants[0];
  const periodLabel = monthKeyToLabel(periodKey);

  // Tenants that already have an invoice for the selected billing month —
  // surfaced so the landlord doesn't accidentally bill the same month twice.
  const billedIds = React.useMemo(
    () =>
      new Set(
        invoices
          .filter((i) => i.periodKey === periodKey)
          .map((i) => i.tenantId),
      ),
    [invoices, periodKey],
  );
  // The tenant's existing invoice for this month, if any — newest first.
  const existingInvoice = tenant
    ? (invoices.find(
      (i) => i.tenantId === tenant.id && i.periodKey === periodKey,
    ) ?? null)
    : null;

  // When the tenant changes, prefill the "previous" readings from history.
  // biome-ignore lint/correctness/useExhaustiveDependencies: prefill only keyed on the selected tenant
  React.useEffect(() => {
    if (!tenant) return;
    const prev = previousReadings(tenant, invoices);
    setWaterPrev(prev.water);
    setWaterCur(prev.water);
    setElecPrev(prev.electricity);
    setElecCur(prev.electricity);
  }, [tenantId]);

  // Default the due date from the tenant's due day within the billed month.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-default on tenant or period change
  React.useEffect(() => {
    if (!tenant) return;
    setDueDate(defaultDueDate(tenant, monthKeyAnchor(periodKey)));
  }, [tenantId, periodKey]);

  const showWater = config.water.enabled && config.water.mode === "metered";
  const showElec =
    config.electricity.enabled && config.electricity.mode === "metered";

  const draft: InvoiceDraft = {
    periodLabel,
    includeRent,
    water: { previous: waterPrev, current: waterCur },
    electricity: { previous: elecPrev, current: elecCur },
    excludedExtraIds: excludedExtras,
  };
  const computed = tenant
    ? computeInvoice(config, tenant, draft)
    : { lines: [], total: 0, readings: {} };

  const save = async (markPaid = false) => {
    if (!tenant || createInvoice.isPending) return;
    const inv = await createInvoice.mutateAsync({
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantUnit: tenant.unit,
      periodLabel,
      periodKey,
      dueDate,
      paidAt: markPaid ? Date.now() : null,
      lines: computed.lines,
      total: computed.total,
      readings: computed.readings,
    });
    onSaved(inv);
  };

  if (!tenant) {
    return (
      <MobileFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Users className="size-8 text-faint" />
          <p className="text-ink-soft">
            Add a tenant before generating invoices.
          </p>
          <Btn onClick={onCancel}>Go back</Btn>
        </div>
      </MobileFrame>
    );
  }

  /* ---- Preview step ---- */
  if (step === "preview") {
    return (
      <MobileFrame>
        <header className="flex items-center gap-3 px-6 pt-6 pb-2">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
            aria-label="Back to edit"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-display text-[1.3rem] font-bold tracking-tight text-ink">
            {t("Preview")}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
          <InvoiceDoc
            profile={config.profile}
            paymentQr={config.paymentQr}
            tenantName={tenant.name}
            tenantUnit={tenant.unit}
            periodLabel={periodLabel}
            dueDate={dueDate}
            lines={computed.lines}
            total={computed.total}
            dateLabel={formatDate(Date.now())}
          />
        </main>

        <div className="space-y-2.5 border-t border-line bg-paper/80 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Btn
            full
            onClick={() => save(false)}
            disabled={createInvoice.isPending}
          >
            <Check className="size-5" />
            {createInvoice.isPending ? "Saving…" : t("Save invoice")}
          </Btn>
          <Btn
            full
            variant="ghost"
            onClick={() => save(true)}
            disabled={createInvoice.isPending}
          >
            <BadgeCheck className="size-5" />
            {t("Save & mark paid")}
          </Btn>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="pressable mx-auto flex items-center gap-1.5 py-1 text-[0.85rem] font-medium text-faint hover:text-ink"
          >
            <Pencil className="size-3.5" />
            {t("Keep editing")}
          </button>
        </div>
      </MobileFrame>
    );
  }

  /* ---- Form step ---- */
  return (
    <MobileFrame>
      <header className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
          aria-label="Cancel"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.3rem] font-bold tracking-tight text-ink">
          {t("New invoice")}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
        <div className="space-y-6">
          {/* Tenant */}
          {tenants.length > 1 && (
            <Field label={t("Tenant")}>
              <TenantPicker
                tenants={tenants}
                value={tenantId}
                onChange={setTenantId}
                billedIds={billedIds}
              />
            </Field>
          )}

          <div className="space-y-6">
            <Field label={t("Billing month")}>
              <Input
                type="month"
                value={periodKey}
                onChange={(e) =>
                  setPeriodKey(e.target.value || currentMonthKey(Date.now()))
                }
                className="w-[90%]"
              />
            </Field>
            <Field label={t("Due date")}>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-[90%]"
              />
            </Field>
          </div>

          {existingInvoice && tenant && (
            <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-3.5">
              <div className="flex gap-2.5">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="text-[0.85rem] leading-relaxed text-amber-900">
                  <span className="font-semibold">{tenant.name}</span> already
                  has an invoice for{" "}
                  <span className="font-semibold">{periodLabel}</span>. Saving
                  will create a second one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenInvoice(existingInvoice.id)}
                className="pressable mt-2.5 ml-[1.625rem] flex items-center gap-1 text-[0.85rem] font-semibold text-amber-800 hover:text-amber-900"
              >
                View existing invoice
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}

          {/* Readings */}
          {(showWater || showElec) && (
            <div className="space-y-3">
              <p className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
                {t("Meter readings")}
              </p>
              {showWater && (
                <ReadingRow
                  icon={<Droplets className="size-4 text-sky-600" />}
                  name={t("Water")}
                  unit={config.water.unit}
                  rate={config.water.rate}
                  previous={waterPrev}
                  current={waterCur}
                  onPrev={setWaterPrev}
                  onCur={setWaterCur}
                />
              )}
              {showElec && (
                <ReadingRow
                  icon={<Zap className="size-4 text-amber-500" />}
                  name={t("Electricity")}
                  unit={config.electricity.unit}
                  rate={config.electricity.rate}
                  previous={elecPrev}
                  current={elecCur}
                  onPrev={setElecPrev}
                  onCur={setElecCur}
                />
              )}
            </div>
          )}

          {/* Rent toggle */}
          {tenant.rent > 0 && (
            <div className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 ring-card">
              <div className="flex-1">
                <p className="font-display text-[1.05rem] font-semibold text-ink">
                  {t("Include rent")}
                </p>
                <p className="text-[0.82rem] text-faint">
                  {formatUSD(tenant.rent)} / month
                </p>
              </div>
              <Switch checked={includeRent} onChange={setIncludeRent} />
            </div>
          )}

          {/* Extra fees — toggle any off for this invoice */}
          {config.extras.length > 0 && (
            <div className="space-y-3">
              <p className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
                {t("Other charges")}
              </p>
              {config.extras.map((extra) => {
                const included = !excludedExtras.includes(extra.id);
                return (
                  <div
                    key={extra.id}
                    className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 ring-card"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-wash text-brand-ink">
                      <Receipt className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[1.02rem] font-semibold text-ink">
                        {extra.name}
                      </p>
                      <p className="text-[0.82rem] text-faint">
                        {formatUSD(extra.amount)}
                      </p>
                    </div>
                    <Switch
                      checked={included}
                      onChange={() => toggleExtra(extra.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Running total */}
          <div className="flex items-center justify-between rounded-3xl bg-ink px-5 py-4 text-white">
            <span className="text-[0.92rem] text-white/70">
              {t("Invoice total")}
            </span>
            <span className="nums font-mono text-[1.4rem] font-bold">
              {formatUSD(computed.total)}
            </span>
          </div>
        </div>
      </main>

      <div className="border-t border-line bg-paper/80 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <Btn full onClick={() => setStep("preview")}>
          {t("Review invoice")}
          <ArrowRight className="size-5" />
        </Btn>
      </div>
    </MobileFrame>
  );
}

function ReadingRow({
  icon,
  name,
  unit,
  rate,
  previous,
  current,
  onPrev,
  onCur,
}: {
  icon: React.ReactNode;
  name: string;
  unit: string;
  rate: number;
  previous: number;
  current: number;
  onPrev: (n: number) => void;
  onCur: (n: number) => void;
}) {
  const t = useT();
  const usage = Math.max(0, current - previous);
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 ring-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-secondary">
          {icon}
        </span>
        <span className="font-display text-[1.02rem] font-semibold text-ink">
          {name}
        </span>
        <span className="ml-auto text-[0.8rem] text-faint">
          {formatUSD(rate)} / {unit}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("Previous")}>
          <NumField value={previous} onValueChange={onPrev} unit={unit} />
        </Field>
        <Field label={t("Current")}>
          <NumField value={current} onValueChange={onCur} unit={unit} />
        </Field>
      </div>
      <p className="mt-2.5 text-[0.84rem] text-ink-soft">
        Usage{" "}
        <span className="nums font-medium text-ink">
          {formatQty(usage)} {unit}
        </span>{" "}
        ={" "}
        <span className="nums font-semibold text-brand-ink">
          {formatUSD(usage * rate)}
        </span>
      </p>
    </div>
  );
}

/** Numeric meter input with a trailing unit. Keeps its own text buffer. */
function NumField({
  value,
  onValueChange,
  unit,
}: {
  value: number;
  onValueChange: (n: number) => void;
  unit: string;
}) {
  const [text, setText] = React.useState(value ? String(value) : "");
  const ref = React.useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resync only on external value change, not local keystrokes
  React.useEffect(() => {
    if (
      parseFloat(text || "0") !== value &&
      document.activeElement !== ref.current
    ) {
      setText(value ? String(value) : "");
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        ref={ref}
        inputMode="decimal"
        className="nums pr-12 font-mono"
        value={text}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          setText(raw);
          onValueChange(parseFloat(raw) || 0);
        }}
      />
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[0.8rem] text-faint">
        {unit}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saved invoice view (with share/download)                            */
/* ------------------------------------------------------------------ */

export function InvoiceView({
  invoice,
  onBack,
}: {
  invoice: Invoice;
  onBack: () => void;
}) {
  const config = useConfig();
  const t = useT();
  const del = useDeleteInvoice();
  const setPaid = useSetInvoicePaid();
  const docRef = React.useRef<HTMLDivElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const now = Date.now();
  const paid = Boolean(invoice.paidAt);

  const remove = async () => {
    setConfirmDelete(false);
    await del.mutateAsync(invoice.id);
    onBack();
  };

  const togglePaid = () => setPaid.mutate({ id: invoice.id, paid: !paid });

  const share = async () => {
    if (!docRef.current || busy) return;
    setBusy(true);
    try {
      const node = docRef.current;
      const { toPng } = await import("html-to-image");

      // html-to-image clones the node and can capture before embedded images
      // (the QR data URL) have decoded — so the QR drops out. Make sure every
      // <img> is fully decoded, wait for fonts, then warm up the renderer with
      // a throwaway pass before the real capture.
      await ensureImagesReady(node);
      await document.fonts.ready;
      const opts = { pixelRatio: 2, backgroundColor: "#ffffff" } as const;
      await toPng(node, opts); // warm-up pass primes the image cache
      const dataUrl = await toPng(node, opts);
      const fileName = `invoice-${invoice.tenantName.replace(/\s+/g, "-").toLowerCase()}-${invoice.periodLabel.replace(/\s+/g, "-").toLowerCase()}.png`;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice · ${invoice.periodLabel}`,
        });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fileName;
        a.click();
      }
    } catch {
      /* user cancelled the share sheet, or rendering failed — no-op */
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileFrame>
      <header className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
          aria-label={t("Back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.3rem] font-bold tracking-tight text-ink">
          {t("Invoice")}
        </h1>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="pressable ml-auto grid size-9 place-items-center rounded-full text-faint hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete invoice"
        >
          <Trash2 className="size-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
        {/* Status strip */}
        <div
          className={cn(
            "mb-3 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[0.9rem]",
            paid
              ? "bg-ok-wash text-ok"
              : invoiceStatus(invoice, now) === "overdue"
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-ink-soft",
          )}
        >
          {paid ? (
            <BadgeCheck className="size-4 shrink-0" />
          ) : (
            <CalendarClock className="size-4 shrink-0" />
          )}
          <span className="font-medium">
            {paid
              ? `Paid ${invoice.paidAt ? `· ${formatDate(invoice.paidAt)}` : ""}`
              : invoice.dueDate
                ? `${statusLabel(invoice, now)} · due ${formatDate(parseDueTs(invoice.dueDate))}`
                : "No due date set"}
          </span>
        </div>

        <InvoiceDoc
          ref={docRef}
          profile={config.profile}
          paymentQr={config.paymentQr}
          tenantName={invoice.tenantName}
          tenantUnit={invoice.tenantUnit}
          periodLabel={invoice.periodLabel}
          dueDate={invoice.dueDate}
          paid={paid}
          lines={invoice.lines}
          total={invoice.total}
          dateLabel={formatDate(invoice.createdAt)}
        />
      </main>

      <div className="space-y-2.5 border-t border-line bg-paper/80 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <Btn
          full
          variant={paid ? "ghost" : "primary"}
          onClick={togglePaid}
          disabled={setPaid.isPending}
        >
          {paid ? (
            <>
              <RotateCcw className="size-4" />
              {t("Mark as unpaid")}
            </>
          ) : (
            <>
              <BadgeCheck className="size-5" />
              {t("Mark as paid")}
            </>
          )}
        </Btn>
        <Btn full variant="ghost" onClick={share} disabled={busy}>
          <Download className="size-5" />
          {busy ? "Preparing…" : t("Share / download")}
        </Btn>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("Delete invoice?")}
        message={
          <>
            {t("This invoice for")}{" "}
            <span className="font-medium text-ink">{invoice.tenantName}</span> ·{" "}
            {invoice.periodLabel} {t("will be removed. This can't be undone.")}
          </>
        }
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        destructive
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </MobileFrame>
  );
}

/* ------------------------------------------------------------------ */
/* The rendered invoice document (exported as image)                   */
/* ------------------------------------------------------------------ */

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-ok-wash text-ok",
  overdue: "bg-destructive/10 text-destructive",
  "due-soon": "bg-amber-100/70 text-amber-700",
  upcoming: "bg-secondary text-faint",
};

function StatusBadge({ invoice, now }: { invoice: Invoice; now: number }) {
  const status = invoiceStatus(invoice, now);
  return (
    <span
      className={cn(
        "nums inline-flex items-center rounded-full px-2 py-0.5 text-[0.72rem] font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {statusLabel(invoice, now)}
    </span>
  );
}

/** Resolve once every <img> inside the node has finished loading & decoding. */
async function ensureImagesReady(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }
      await img.decode?.().catch(() => { });
    }),
  );
}

interface DocProps {
  profile: LandlordProfile;
  paymentQr: string;
  tenantName: string;
  tenantUnit: string;
  periodLabel: string;
  dueDate?: string;
  paid?: boolean;
  lines: Invoice["lines"];
  total: number;
  dateLabel: string;
}

const InvoiceDoc = React.forwardRef<HTMLDivElement, DocProps>(
  function InvoiceDoc(
    {
      profile,
      paymentQr,
      tenantName,
      tenantUnit,
      periodLabel,
      dueDate,
      paid,
      lines,
      total,
      dateLabel,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="animate-rise overflow-hidden rounded-[1.6rem] border border-line bg-white ring-card"
      >
        {/* Header band */}
        <div className="bg-ink px-6 pt-6 pb-7 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-[1.35rem] font-bold tracking-tight">
                {profile.name || "—"}
              </p>
              {profile.property && (
                <p className="mt-0.5 text-[0.86rem] text-white/65">
                  {profile.property}
                </p>
              )}
              {profile.phone && (
                <p className="text-[0.86rem] text-white/65">{profile.phone}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[0.72rem] font-medium tracking-[0.22em] text-white/55 uppercase">
                Invoice
              </p>
              <p className="mt-1 font-display text-[1.05rem] font-semibold">
                {periodLabel}
              </p>
              {dueDate && (
                <p className="mt-1 text-[0.78rem] text-white/65">
                  Due {formatDate(parseDueTs(dueDate))}
                </p>
              )}
              {paid && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-ok/20 px-2 py-0.5 text-[0.72rem] font-semibold tracking-wide text-ok uppercase">
                  Paid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Billed to */}
        <div className="px-6 pt-5">
          <p className="text-[0.72rem] font-medium tracking-[0.16em] text-faint uppercase">
            Billed to
          </p>
          <p className="mt-1 font-display text-[1.1rem] font-semibold text-ink">
            {tenantName}
            {tenantUnit && (
              <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 align-middle text-[0.78rem] font-medium text-ink-soft">
                {tenantUnit}
              </span>
            )}
          </p>
        </div>

        {/* Line items */}
        <div className="mt-4 px-6">
          <div className="divide-y divide-line">
            {lines.map((l, i) => (
              <div
                key={`${l.label}-${i}`}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.96rem] font-medium text-ink">
                    {l.label}
                  </p>
                  {l.detail && (
                    <p className="nums mt-0.5 text-[0.8rem] text-faint">
                      {l.detail}
                    </p>
                  )}
                </div>
                <span className="nums shrink-0 font-mono text-[0.96rem] font-medium text-ink">
                  {formatUSD(l.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-1 px-6">
          <div className="flex items-center justify-between border-t-2 border-ink/10 py-4">
            <span className="font-display text-[1.05rem] font-bold text-ink">
              Total due
            </span>
            <span className="nums font-mono text-[1.5rem] font-extrabold text-ink">
              {formatUSD(total)}
            </span>
          </div>
        </div>

        {/* Payment QR */}
        {paymentQr && (
          <div className="mx-6 mb-6 flex flex-col items-center rounded-2xl bg-brand-wash px-4 py-5">
            <p className="font-display text-[1.05rem] font-semibold text-brand-ink">
              Scan to pay
            </p>
            <p className="mt-0.5 text-center text-[0.82rem] text-ink-soft">
              Use your banking app to scan and settle this invoice.
            </p>
            <div className="mt-3.5 grid place-items-center overflow-hidden rounded-xl border border-line bg-white p-3">
              {/* biome-ignore lint/performance/noImgElement: user data URL, captured into the exported image */}
              <img
                src={paymentQr}
                alt="Payment QR"
                width={232}
                height={232}
                className="block size-[232px] object-contain"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-line px-6 py-3.5">
          <p className="text-center text-[0.78rem] text-faint">
            Issued {dateLabel} · Thank you!
          </p>
        </div>
      </div>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Tenant picker — searchable sheet, scales past a wall of chips       */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function BilledBadge() {
  const tr = useT();
  return (
    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[0.68rem] font-semibold text-amber-700">
      {tr("Billed")}
    </span>
  );
}

function TenantPicker({
  tenants,
  value,
  onChange,
  billedIds,
}: {
  tenants: Tenant[];
  value: string;
  onChange: (id: string) => void;
  /** Tenant ids already invoiced for the selected billing month. */
  billedIds: Set<string>;
}) {
  const tr = useT();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selected = tenants.find((t) => t.id === value);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.unit.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q),
    )
    : tenants;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable flex h-13 w-full items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-left ring-soft transition-colors hover:border-line2"
      >
        <span className="min-w-0 flex-1 truncate text-[1.05rem] text-ink">
          {selected ? (
            <>
              {selected.name}
              {selected.unit ? (
                <span className="text-faint"> · {selected.unit}</span>
              ) : null}
            </>
          ) : (
            <span className="text-faint">{tr("Select tenant")}</span>
          )}
        </span>
        {selected && billedIds.has(selected.id) && <BilledBadge />}
        <ChevronDown className="size-4 shrink-0 text-faint" />
      </button>

      <Sheet open={open} onClose={close} title={tr("Select tenant")}>
        <div className="space-y-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
            <Input
              className="pl-11"
              placeholder={tr("Search name, unit or phone")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="py-8 text-center text-[0.9rem] text-faint">
                {tr("No tenants match.")}
              </li>
            ) : (
              filtered.map((t) => {
                const active = t.id === value;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(t.id);
                        close();
                      }}
                      className={cn(
                        "pressable flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
                        active
                          ? "border-brand bg-brand-wash"
                          : "border-line bg-surface hover:border-line2",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-wash font-display text-[0.85rem] font-bold text-brand-ink">
                        {initials(t.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[1rem] font-semibold text-ink">
                          {t.name}
                        </span>
                        {t.unit ? (
                          <span className="block truncate text-[0.78rem] text-faint">
                            {t.unit}
                          </span>
                        ) : null}
                      </span>
                      {billedIds.has(t.id) && <BilledBadge />}
                      {active && (
                        <Check className="size-4 shrink-0 text-brand" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Sheet>
    </>
  );
}
