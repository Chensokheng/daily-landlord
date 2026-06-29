"use client";

import { ChevronRight, Send } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { monthKeyToLabel } from "@/lib/due";
import { readingRequestMessage, shareOrCopy } from "@/lib/messages";
import type { Config, Tenant } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Share/copy a reading-request message for a tenant + billing month. */
export async function requestReadings(
  tenant: Tenant,
  config: Config,
  monthKey: string,
) {
  const msg = readingRequestMessage(tenant, config, monthKeyToLabel(monthKey));
  const res = await shareOrCopy(msg, "Reading request");
  if (res === "copied") {
    alert("Message copied — paste it to your tenant.");
  } else if (res === "failed") {
    alert(`Couldn't share automatically. Message:\n\n${msg}`);
  }
}

/** Hook giving a ready-to-call requestReadings bound to the current config. */
export function useRequestReadings() {
  const config = useConfig();
  return (tenant: Tenant, monthKey: string) =>
    requestReadings(tenant, config, monthKey);
}

export type Urgency = "overdue" | "soon" | "upcoming";

/** Bucket a to-bill tenant by how close its due day is. */
export function billUrgency(daysUntilDue: number): Urgency {
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 2) return "soon";
  return "upcoming";
}

/** Short magnitude label for the per-row badge (group header gives context). */
function shortDueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d`;
  if (days === 0) return "today";
  return `${days}d`;
}

/**
 * Compact, tappable to-bill row for the grouped billing list. Tapping the row
 * generates the invoice; tenant-reports tenants get a small request-readings
 * button that sits above the row's stretched tap target.
 */
export function BillTodoRow({
  tenant,
  monthKey,
  daysUntilDue,
  onRequestReadings,
  onGenerate,
}: {
  tenant: Tenant;
  monthKey: string;
  daysUntilDue: number;
  onRequestReadings: (tenant: Tenant, monthKey: string) => void;
  onGenerate: (tenant: Tenant, monthKey: string) => void;
}) {
  const reports = tenant.readingSource === "tenant";
  const urgency = billUrgency(daysUntilDue);
  const badgeTone =
    urgency === "overdue"
      ? "text-destructive"
      : urgency === "soon"
        ? "text-amber-600"
        : "text-faint";

  return (
    <li className="relative flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-wash font-display text-[0.85rem] font-bold text-brand-ink">
        {initials(tenant.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[1rem] font-semibold text-ink">
          {tenant.name}
        </p>
        <p className="truncate text-[0.78rem] text-faint">
          {tenant.unit ? `${tenant.unit} · ` : ""}
          {reports ? "tenant reports" : "you read it"}
        </p>
      </div>

      {reports && (
        <button
          type="button"
          onClick={() => onRequestReadings(tenant, monthKey)}
          className="pressable relative z-10 grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-soft hover:text-ink"
          aria-label={`Request readings from ${tenant.name}`}
        >
          <Send className="size-4" />
        </button>
      )}

      <span
        className={`nums shrink-0 text-[0.8rem] font-semibold ${badgeTone}`}
      >
        {shortDueLabel(daysUntilDue)}
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" />

      {/* Stretched tap target → bill this tenant. */}
      <button
        type="button"
        onClick={() => onGenerate(tenant, monthKey)}
        className="absolute inset-0"
        aria-label={`Bill ${tenant.name}`}
      />
    </li>
  );
}
