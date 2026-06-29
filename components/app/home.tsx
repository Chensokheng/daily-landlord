

import {
  ArrowRight,
  Droplets,
  Gauge,
  QrCode,
  Receipt,
  RotateCcw,
  Settings2,
  TriangleAlert,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { useConfig } from "@/hooks/use-config";
import { useInvoices } from "@/hooks/use-invoices";
import { useTenants } from "@/hooks/use-tenants";
import { attentionItems, billingTodos, statusLabel } from "@/lib/due";
import { useT } from "@/lib/i18n";
import type { UtilityConfig } from "@/lib/types";
import { formatUSD } from "@/lib/utils";
import { BillTodoRow } from "./bill-todo";
import type { InvoiceSeed } from "./invoices";
import { MobileFrame } from "./ui";

export function Home({
  onOpenTenants,
  onNewInvoice,
  onOpenInvoices,
  onOpenBilling,
  onOpenSettings,
}: {
  onOpenTenants: () => void;
  onNewInvoice: (seed?: InvoiceSeed) => void;
  onOpenInvoices: () => void;
  onOpenBilling: () => void;
  onOpenSettings: () => void;
}) {
  const c = useConfig();
  const t = useT();
  const { data: tenants = [] } = useTenants();
  const { data: invoices = [] } = useInvoices();
  const firstName = c.profile.name.trim().split(/\s+/)[0] || "there";

  const now = Date.now();
  const todos = billingTodos(tenants, invoices, now);
  const TODO_PREVIEW = 3;
  const visibleTodos = todos.slice(0, TODO_PREVIEW);
  const hiddenTodos = todos.length - visibleTodos.length;
  const attention = attentionItems(invoices, now);
  const overdueCount = attention.filter((a) => a.status === "overdue").length;
  const dueSoonCount = attention.length - overdueCount;

  const utilLine = (u: UtilityConfig) =>
    !u.enabled
      ? "Off"
      : u.mode === "metered"
        ? `${formatUSD(u.rate)}/${u.unit}`
        : `${formatUSD(u.flatAmount)} flat`;

  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col px-6 pt-8 pb-8">
        {/* Greeting */}
        <header className="animate-rise flex items-start justify-between">
          <div>
            <p className="text-[0.8rem] font-medium tracking-[0.16em] text-brand uppercase">
              Tally
            </p>
            <h1 className="mt-1.5 font-display text-[1.9rem] leading-tight font-bold tracking-tight text-ink">
              {t("Hi, {name}.", { name: firstName })}
            </h1>
            {c.profile.property && (
              <p className="mt-0.5 text-[0.92rem] text-ink-soft">
                {c.profile.property}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="pressable grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-soft ring-soft hover:text-ink"
            aria-label={t("Settings")}
          >
            <Settings2 className="size-5" />
          </button>
        </header>

        {/* Stat row */}
        <div
          className="animate-rise mt-7 grid grid-cols-2 gap-3"
          style={{ animationDelay: "0.06s" }}
        >
          <Stat
            icon={<Users className="size-4" />}
            value={String(tenants.length)}
            label={t("Tenants")}
            onClick={onOpenTenants}
          />
          <Stat
            icon={<Receipt className="size-4" />}
            value={String(invoices.length)}
            label={t("Invoices")}
            onClick={onOpenInvoices}
          />
        </div>

        {/* To bill this month */}
        {todos.length > 0 && (
          <div
            className="animate-rise mt-5"
            style={{ animationDelay: "0.08s" }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Gauge className="size-3.5 text-brand" />
              <h2 className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
                {t("To bill this month")}
              </h2>
              <span className="nums ml-auto text-[0.8rem] text-faint">
                {todos.length}
              </span>
            </div>
            <ul className="overflow-hidden rounded-3xl border border-line bg-surface ring-card">
              {visibleTodos.map(({ tenant, monthKey, daysUntilDue }) => (
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
            {hiddenTodos > 0 && (
              <button
                type="button"
                onClick={onOpenBilling}
                className="pressable mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface py-2.5 text-[0.85rem] font-medium text-brand ring-card hover:bg-secondary"
              >
                {t("View all {n} to bill", { n: todos.length })}
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Needs attention */}
        {attention.length > 0 && (
          <button
            type="button"
            onClick={onOpenInvoices}
            className="pressable animate-rise mt-5 w-full rounded-3xl border border-destructive/20 bg-destructive/5 p-4 text-left ring-card"
            style={{ animationDelay: "0.09s" }}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-3.5" />
              </span>
              <h2 className="text-[0.8rem] font-semibold tracking-wide text-ink uppercase">
                {t("Needs attention")}
              </h2>
              <span className="ml-auto text-[0.8rem] font-medium text-ink-soft">
                {overdueCount > 0 && t("{n} overdue", { n: overdueCount })}
                {overdueCount > 0 && dueSoonCount > 0 && " · "}
                {dueSoonCount > 0 && t("{n} due soon", { n: dueSoonCount })}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {attention.slice(0, 3).map(({ invoice, status }) => (
                <li
                  key={invoice.id}
                  className="flex items-center gap-2 text-[0.9rem]"
                >
                  <span className="truncate font-medium text-ink">
                    {invoice.tenantName}
                  </span>
                  <span className="truncate text-[0.82rem] text-faint">
                    {invoice.periodLabel}
                  </span>
                  <span
                    className={
                      "nums ml-auto shrink-0 rounded-full px-2 py-0.5 text-[0.72rem] font-semibold " +
                      (status === "overdue"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-100/70 text-amber-700")
                    }
                  >
                    {statusLabel(invoice, now)}
                  </span>
                </li>
              ))}
            </ul>
            {attention.length > 3 && (
              <p className="mt-2 text-[0.8rem] font-medium text-brand">
                +{attention.length - 3} more →
              </p>
            )}
          </button>
        )}

        {/* Primary actions */}
        <div
          className="animate-rise mt-5 space-y-3"
          style={{ animationDelay: "0.12s" }}
        >
          <ActionCard
            icon={<UserPlus className="size-5" />}
            title={
              tenants.length === 0 ? t("Add a tenant") : t("Manage tenants")
            }
            sub={
              tenants.length === 0
                ? t("Name, phone & their monthly rent")
                : t(
                  tenants.length > 1
                    ? "{count} tenants — tap to view or add"
                    : "{count} tenant — tap to view or add",
                  { count: tenants.length },
                )
            }
            tone="brand"
            onClick={onOpenTenants}
          />
          <ActionCard
            icon={<Receipt className="size-5" />}
            title={t("Generate an invoice")}
            sub={t("Enter readings & send in seconds")}
            tone="ink"
            disabled={tenants.length === 0}
            disabledNote={t("Add a tenant first")}
            onClick={onNewInvoice}
          />
        </div>

        {/* Config summary */}
        <div className="animate-rise mt-7" style={{ animationDelay: "0.18s" }}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
              {t("Your rates")}
            </h2>
            <button
              type="button"
              onClick={onOpenSettings}
              className="pressable flex items-center gap-1 text-[0.82rem] font-medium text-brand"
            >
              {t("Edit")}
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface ring-card">
            <RateRow
              icon={<Droplets className="size-4 text-sky-600" />}
              label={t("Water")}
              value={utilLine(c.water)}
            />
            <RateRow
              icon={<Zap className="size-4 text-amber-500" />}
              label={t("Electricity")}
              value={utilLine(c.electricity)}
            />
            {c.extras.map((e) => (
              <RateRow
                key={e.id}
                icon={<Receipt className="size-4 text-brand-ink" />}
                label={e.name}
                value={`${formatUSD(e.amount)} flat`}
              />
            ))}
          </div>
        </div>

        {/* Payment QR */}
        {c.paymentQr && (
          <div className="animate-rise mt-5" style={{ animationDelay: "0.2s" }}>
            <div className="mb-2.5 flex items-center gap-1.5">
              <QrCode className="size-3.5 text-faint" />
              <h2 className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
                {t("Payment QR")}
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="pressable flex w-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left ring-card hover:border-line2"
            >
              <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-white">
                {/* biome-ignore lint/performance/noImgElement: user-supplied data URL, not a static asset */}
                <img
                  src={c.paymentQr}
                  alt="Your payment QR"
                  className="size-full object-contain"
                />
              </div>
              <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                {t(
                  "Shown on every invoice so tenants can scan and pay you directly.",
                )}
              </p>
              <ArrowRight className="size-4 shrink-0 text-faint" />
            </button>
          </div>
        )}

        <div className="flex-1" />

        <p
          className="animate-rise mt-8 flex items-center justify-center gap-1.5 text-center text-[0.8rem] text-faint"
          style={{ animationDelay: "0.24s" }}
        >
          <RotateCcw className="size-3.5" />
          {t("Everything stays on this device.")}
        </p>
      </div>
    </MobileFrame>
  );
}

function Stat({
  icon,
  value,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="pressable rounded-3xl border border-line bg-surface p-4 text-left ring-card enabled:hover:border-line2 disabled:cursor-default"
    >
      <div className="flex items-center gap-2 text-faint">
        {icon}
        <span className="text-[0.8rem] font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p className="nums mt-2 font-display text-[2rem] leading-none font-bold text-ink">
        {value}
      </p>
    </button>
  );
}

function ActionCard({
  icon,
  title,
  sub,
  tone,
  disabled,
  disabledNote,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "brand" | "ink";
  disabled?: boolean;
  disabledNote?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="pressable group flex w-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left ring-card disabled:pointer-events-none disabled:opacity-55"
    >
      <span
        className={
          "grid size-12 shrink-0 place-items-center rounded-2xl text-white " +
          (tone === "brand" ? "bg-brand ring-brand" : "bg-ink")
        }
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-display text-[1.08rem] font-semibold text-ink">
          {title}
        </span>
        <span className="block text-[0.85rem] text-faint">
          {disabled && disabledNote ? disabledNote : sub}
        </span>
      </span>
      <ArrowRight className="size-5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
    </button>
  );
}

function RateRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
        {icon}
      </span>
      <span className="text-[0.92rem] text-ink-soft">{label}</span>
      <span className="nums ml-auto font-mono text-[0.92rem] font-medium text-ink">
        {value}
      </span>
    </div>
  );
}
