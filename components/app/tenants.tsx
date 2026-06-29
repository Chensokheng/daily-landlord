

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  DoorOpen,
  Droplets,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/use-config";
import { invoiceKeys, useInvoices } from "@/hooks/use-invoices";
import {
  tenantKeys,
  useCreateTenant,
  useDeleteTenant,
  useTenants,
  useUpdateTenant,
} from "@/hooks/use-tenants";
import { currentMonthKey, invoiceStatus, nextMonthKey } from "@/lib/due";
import { useT } from "@/lib/i18n";
import { seedMockTenants } from "@/lib/seed";
import { isTenantActive, type Tenant } from "@/lib/types";
import { cn, formatUSD } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  Field,
  MobileFrame,
  MoneyField,
  Segmented,
  Sheet,
  Switch,
} from "./ui";

type SheetState = { mode: "add" } | { mode: "edit"; tenant: Tenant } | null;
type StatusFilter = "active" | "inactive" | "all";
type Confirm = { kind: "delete" | "moveout"; tenant: Tenant } | null;

const IS_DEV = process.env.NODE_ENV !== "production";

export function Tenants({
  onBack,
  onOpenInvoices,
}: {
  onBack: () => void;
  onOpenInvoices: (tenantId: string) => void;
}) {
  const { data: tenants = [] } = useTenants();
  const { data: invoices = [] } = useInvoices();
  const t = useT();
  const del = useDeleteTenant();
  const update = useUpdateTenant();
  const qc = useQueryClient();
  const [sheet, setSheet] = React.useState<SheetState>(null);
  const [confirm, setConfirm] = React.useState<Confirm>(null);
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("active");

  const seed = () => {
    seedMockTenants();
    qc.invalidateQueries({ queryKey: tenantKeys.all });
    qc.invalidateQueries({ queryKey: invoiceKeys.all });
  };

  const now = Date.now();
  const overdueByTenant = (id: string) =>
    invoices.filter(
      (i) => i.tenantId === id && invoiceStatus(i, now) === "overdue",
    ).length;

  const shown = tenants.filter((t) =>
    statusFilter === "all"
      ? true
      : statusFilter === "active"
        ? isTenantActive(t)
        : !isTenantActive(t),
  );

  // Reactivating is harmless — do it directly; moving out asks first.
  const toggleStatus = (t: Tenant) => {
    if (isTenantActive(t)) {
      setConfirm({ kind: "moveout", tenant: t });
    } else {
      update.mutate({ id: t.id, patch: { status: "active" } });
    }
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "delete") {
      del.mutate(confirm.tenant.id);
    } else {
      update.mutate({ id: confirm.tenant.id, patch: { status: "inactive" } });
    }
    setConfirm(null);
  };

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
          {t("Tenants")}
        </h1>
        {tenants.length > 0 && (
          <span className="nums ml-auto rounded-full bg-secondary px-2.5 py-1 text-[0.8rem] font-medium text-ink-soft">
            {tenants.length}
          </span>
        )}
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-6 pt-24 pb-28">
        {tenants.length === 0 ? (
          <EmptyState
            onAdd={() => setSheet({ mode: "add" })}
            onSeed={IS_DEV ? seed : undefined}
          />
        ) : (
          <>
            <div className="pb-3">
              <Segmented<StatusFilter>
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "active", label: t("Active") },
                  { value: "inactive", label: t("Moved out") },
                  { value: "all", label: t("All") },
                ]}
              />
            </div>
            {shown.length === 0 ? (
              <p className="mt-10 text-center text-[0.9rem] text-faint">
                {statusFilter === "inactive"
                  ? t("No moved-out tenants.")
                  : t("No tenants here.")}
              </p>
            ) : (
              <ul className="space-y-3">
                {shown.map((t) => (
                  <TenantCard
                    key={t.id}
                    tenant={t}
                    overdue={overdueByTenant(t.id)}
                    onOpenInvoices={() => onOpenInvoices(t.id)}
                    onEdit={() => setSheet({ mode: "edit", tenant: t })}
                    onToggleStatus={() => toggleStatus(t)}
                    onDelete={() => setConfirm({ kind: "delete", tenant: t })}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {tenants.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[460px] space-y-2 border-t border-line bg-paper/85 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Btn full onClick={() => setSheet({ mode: "add" })}>
            <Plus className="size-5" />
            {t("Add tenant")}
          </Btn>
          {IS_DEV && (
            <button
              type="button"
              onClick={seed}
              className="pressable w-full rounded-xl py-2 text-[0.8rem] font-medium text-faint hover:text-ink"
            >
              Seed 20 mock tenants (dev)
            </button>
          )}
        </div>
      )}

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.mode === "edit" ? t("Edit tenant") : t("New tenant")}
      >
        {sheet && (
          <TenantForm
            tenant={sheet.mode === "edit" ? sheet.tenant : undefined}
            onDone={() => setSheet(null)}
          />
        )}
      </Sheet>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.kind === "delete"
            ? t("Delete tenant?")
            : t("Mark as moved out?")
        }
        message={
          confirm?.kind === "delete"
            ? t(
              "{name} will be removed for good. Past invoices stay. Can't be undone.",
              { name: confirm.tenant.name },
            )
            : confirm
              ? t(
                "{name} will stop showing in To bill. You can reactivate anytime.",
                { name: confirm.tenant.name },
              )
              : ""
        }
        confirmLabel={confirm?.kind === "delete" ? t("Delete") : t("Move out")}
        cancelLabel={t("Cancel")}
        destructive={confirm?.kind === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </MobileFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({
  onAdd,
  onSeed,
}: {
  onAdd: () => void;
  onSeed?: () => void;
}) {
  const t = useT();
  return (
    <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
      <div className="grid size-16 place-items-center rounded-[1.3rem] border border-line bg-surface text-brand ring-card">
        <Users className="size-7" />
      </div>
      <h2 className="mt-5 font-display text-[1.4rem] font-bold tracking-tight text-ink">
        {t("No tenants yet")}
      </h2>
      <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-relaxed text-ink-soft">
        {t(
          "Add the people you bill. Their rent and meter baselines feed straight into invoices.",
        )}
      </p>
      <div className="mt-7 w-full max-w-[16rem]">
        <Btn full onClick={onAdd}>
          <UserPlus className="size-5" />
          {t("Add your first tenant")}
        </Btn>
      </div>
      {onSeed && (
        <button
          type="button"
          onClick={onSeed}
          className="pressable mt-3 text-[0.8rem] font-medium text-faint hover:text-ink"
        >
          Seed 20 mock tenants (dev)
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tenant card                                                        */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function TenantCard({
  tenant: t,
  overdue,
  onOpenInvoices,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  tenant: Tenant;
  overdue: number;
  onOpenInvoices: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const tr = useT();
  const active = isTenantActive(t);
  const hasMeta =
    t.startWater > 0 || t.startElectricity > 0 || t.moveInDate || t.notes;

  return (
    <li
      className={cn(
        "animate-step overflow-hidden rounded-3xl border border-line bg-surface ring-card",
        !active && "opacity-75",
      )}
    >
      <button
        type="button"
        onClick={onOpenInvoices}
        className="pressable flex w-full items-center gap-3.5 px-4 py-4 text-left"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-wash font-display text-[1.05rem] font-bold text-brand-ink">
          {initials(t.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-[1.1rem] font-semibold text-ink">
              {t.name}
            </p>
            {!active ? (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.72rem] font-semibold text-faint">
                {tr("Moved out")}
              </span>
            ) : (
              overdue > 0 && (
                <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[0.72rem] font-semibold text-destructive">
                  {tr("{n} overdue", { n: overdue })}
                </span>
              )
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.84rem] text-faint">
            {t.unit && (
              <span className="inline-flex items-center gap-1">
                <DoorOpen className="size-3.5" />
                {t.unit}
              </span>
            )}
            {t.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                {t.phone}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="nums font-mono text-[1.05rem] font-semibold text-ink">
            {formatUSD(t.rent)}
          </p>
          <p className="text-[0.74rem] text-faint">{tr("rent / mo")}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-faint" />
      </button>

      {hasMeta && (
        <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3">
          {t.startWater > 0 && (
            <Chip icon={<Droplets className="size-3 text-sky-600" />}>
              {t.startWater} start
            </Chip>
          )}
          {t.startElectricity > 0 && (
            <Chip icon={<Zap className="size-3 text-amber-500" />}>
              {t.startElectricity} start
            </Chip>
          )}
          {t.moveInDate && (
            <Chip icon={<CalendarDays className="size-3" />}>
              {t.moveInDate}
            </Chip>
          )}
          {t.notes && (
            <Chip icon={<StickyNote className="size-3" />}>Note</Chip>
          )}
        </div>
      )}

      <div className="flex gap-2 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={onEdit}
          className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-[0.85rem] font-medium text-ink-soft hover:text-ink"
        >
          <Pencil className="size-3.5" />
          {tr("Edit")}
        </button>
        <button
          type="button"
          onClick={onToggleStatus}
          className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-[0.85rem] font-medium text-ink-soft hover:text-ink"
        >
          {active ? (
            <>
              <UserMinus className="size-3.5" />
              {tr("Moved out")}
            </>
          ) : (
            <>
              <UserCheck className="size-3.5" />
              {tr("Reactivate")}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="pressable flex items-center justify-center rounded-xl px-3 py-2 text-faint hover:bg-destructive/10 hover:text-destructive"
          aria-label={`${tr("Delete")} ${t.name}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="nums inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[0.76rem] font-medium text-ink-soft">
      {icon}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Add / edit form (inside the slide-up sheet)                         */
/* ------------------------------------------------------------------ */

function TenantForm({
  tenant,
  onDone,
}: {
  tenant?: Tenant;
  onDone: () => void;
}) {
  const { water, electricity } = useConfig();
  const t = useT();
  const create = useCreateTenant();
  const update = useUpdateTenant();
  const editing = Boolean(tenant);

  const [name, setName] = React.useState(tenant?.name ?? "");
  const [unit, setUnit] = React.useState(tenant?.unit ?? "");
  const [phone, setPhone] = React.useState(tenant?.phone ?? "");
  const [rent, setRent] = React.useState(tenant?.rent ?? 0);
  const [startWater, setStartWater] = React.useState(tenant?.startWater ?? 0);
  const [startElectricity, setStartElectricity] = React.useState(
    tenant?.startElectricity ?? 0,
  );
  const [moveInDate, setMoveInDate] = React.useState(tenant?.moveInDate ?? "");
  const [dueDay, setDueDay] = React.useState(tenant?.dueDay ?? 0);
  const [settledThisMonth, setSettledThisMonth] = React.useState(false);
  const [notes, setNotes] = React.useState(tenant?.notes ?? "");

  const showWater = water.enabled && water.mode === "metered";
  const showElec = electricity.enabled && electricity.mode === "metered";
  const valid = name.trim().length > 0 && phone.trim().length > 0;
  const busy = create.isPending || update.isPending;

  const submit = async () => {
    if (!valid || busy) return;
    const now = Date.now();
    // Editing keeps the tenant's existing start; new tenants who are already
    // settled this month start the reminder next month.
    const firstBillKey = tenant
      ? tenant.firstBillKey || currentMonthKey(now)
      : settledThisMonth
        ? nextMonthKey(now)
        : currentMonthKey(now);
    const payload = {
      name: name.trim(),
      unit: unit.trim(),
      phone: phone.trim(),
      rent,
      startWater: showWater ? startWater : 0,
      startElectricity: showElec ? startElectricity : 0,
      moveInDate,
      dueDay,
      firstBillKey,
      notes: notes.trim(),
    };
    if (tenant) {
      await update.mutateAsync({ id: tenant.id, patch: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone();
  };

  return (
    <div className="space-y-5 pb-2">
      <Field label={t("Name")}>
        <Input
          placeholder="e.g. Dara Kim"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("Room / unit")} hint={t("optional")}>
          <Input
            placeholder="e.g. 3A"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </Field>
        <Field label={t("Monthly rent")} hint={t("optional")}>
          <MoneyField value={rent} onValueChange={setRent} />
        </Field>
      </div>

      <Field label={t("Phone")} hint={t("required")}>
        <Input
          type="tel"
          inputMode="tel"
          placeholder="e.g. 012 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>

      {(showWater || showElec) && (
        <div className="rounded-2xl border border-dashed border-line2 bg-surface/60 p-4">
          <p className="mb-3 text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
            {t("Starting meter readings")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {showWater && (
              <Field label={t("Water")}>
                <MeterField
                  value={startWater}
                  onValueChange={setStartWater}
                  unit={water.unit}
                />
              </Field>
            )}
            {showElec && (
              <Field label={t("Electricity")}>
                <MeterField
                  value={startElectricity}
                  onValueChange={setStartElectricity}
                  unit={electricity.unit}
                />
              </Field>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("Move-in date")} hint={t("optional")}>
          <Input
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
          />
        </Field>
        <Field label={t("Rent due day")} hint={t("optional")}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="e.g. 5"
            value={dueDay ? String(dueDay) : ""}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setDueDay(Number.isFinite(n) ? Math.min(31, Math.max(0, n)) : 0);
            }}
          />
        </Field>
      </div>

      {!editing && dueDay >= 1 && (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 ring-soft">
          <div className="flex-1">
            <p className="text-[0.95rem] font-medium text-ink">
              {t("Already paid for this month")}
            </p>
            <p className="text-[0.8rem] text-faint">
              {t("Start the billing reminder next month instead.")}
            </p>
          </div>
          <Switch checked={settledThisMonth} onChange={setSettledThisMonth} />
        </div>
      )}

      <Field label={t("Notes")} hint={t("optional")}>
        <textarea
          placeholder="Deposit held, special terms…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[4.5rem] w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[1.02rem] text-ink ring-soft outline-none transition-[color,box-shadow,border-color] placeholder:text-faint/70 focus:border-brand focus:ring-3 focus:ring-brand-glow/25"
        />
      </Field>

      <Btn full onClick={submit} disabled={!valid || busy} className="mt-1">
        <UserPlus className="size-5" />
        {editing ? t("Save changes") : t("Save tenant")}
      </Btn>
    </div>
  );
}

/** Numeric meter input with a unit suffix (m³, kWh) — no currency. */
function MeterField({
  value,
  onValueChange,
  unit,
}: {
  value: number;
  onValueChange: (n: number) => void;
  unit: string;
}) {
  const [text, setText] = React.useState(value ? String(value) : "");
  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        className={cn("nums pr-12 font-mono")}
        value={text}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          setText(raw);
          onValueChange(parseFloat(raw) || 0);
        }}
      />
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[0.82rem] text-faint">
        {unit}
      </span>
    </div>
  );
}
