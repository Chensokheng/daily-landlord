"use client";

import {
  ArrowRight,
  Droplets,
  QrCode,
  Receipt,
  RotateCcw,
  Settings2,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { formatUSD, useApp } from "@/lib/store";
import type { UtilityConfig } from "@/lib/types";
import { MobileFrame } from "./ui";

export function Home() {
  const { state, resetAll } = useApp();
  const c = state.config;
  const firstName = c.profile.name.trim().split(/\s+/)[0] || "there";

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
              Hi, {firstName}.
            </h1>
            {c.profile.property && (
              <p className="mt-0.5 text-[0.92rem] text-ink-soft">
                {c.profile.property}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset everything and start setup again?"))
                resetAll();
            }}
            className="pressable grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-soft ring-soft hover:text-ink"
            aria-label="Settings"
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
            value={String(state.tenants.length)}
            label="Tenants"
          />
          <Stat
            icon={<Receipt className="size-4" />}
            value={String(state.invoices.length)}
            label="Invoices"
          />
        </div>

        {/* Primary actions */}
        <div
          className="animate-rise mt-5 space-y-3"
          style={{ animationDelay: "0.12s" }}
        >
          <ActionCard
            icon={<UserPlus className="size-5" />}
            title="Add a tenant"
            sub="Name, phone & their monthly rent"
            tone="brand"
          />
          <ActionCard
            icon={<Receipt className="size-5" />}
            title="Generate an invoice"
            sub="Enter readings & send in seconds"
            tone="ink"
            disabled={state.tenants.length === 0}
            disabledNote="Add a tenant first"
          />
        </div>

        {/* Config summary */}
        <div className="animate-rise mt-7" style={{ animationDelay: "0.18s" }}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
              Your rates
            </h2>
            <button
              type="button"
              className="pressable flex items-center gap-1 text-[0.82rem] font-medium text-brand"
            >
              Edit
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface ring-card">
            <RateRow
              icon={<Droplets className="size-4 text-sky-600" />}
              label="Water"
              value={utilLine(c.water)}
            />
            <RateRow
              icon={<Zap className="size-4 text-amber-500" />}
              label="Electricity"
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
                Payment QR
              </h2>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 ring-card">
              <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-white">
                {/* biome-ignore lint/performance/noImgElement: user-supplied data URL, not a static asset */}
                <img
                  src={c.paymentQr}
                  alt="Your payment QR"
                  className="size-full object-contain"
                />
              </div>
              <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                Shown on every invoice so tenants can scan and pay you directly.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1" />

        <p
          className="animate-rise mt-8 flex items-center justify-center gap-1.5 text-center text-[0.8rem] text-faint"
          style={{ animationDelay: "0.24s" }}
        >
          <RotateCcw className="size-3.5" />
          Setup complete — tenants & invoices are coming next.
        </p>
      </div>
    </MobileFrame>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 ring-card">
      <div className="flex items-center gap-2 text-faint">
        {icon}
        <span className="text-[0.8rem] font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p className="nums mt-2 font-display text-[2rem] leading-none font-bold text-ink">
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  sub,
  tone,
  disabled,
  disabledNote,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "brand" | "ink";
  disabled?: boolean;
  disabledNote?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
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
