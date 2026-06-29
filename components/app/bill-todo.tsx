"use client";

import { ChevronRight } from "lucide-react";
import type { Tenant } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
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
 * generates the invoice for this tenant.
 */
export function BillTodoRow({
  tenant,
  monthKey,
  daysUntilDue,
  onGenerate,
}: {
  tenant: Tenant;
  monthKey: string;
  daysUntilDue: number;
  onGenerate: (tenant: Tenant, monthKey: string) => void;
}) {
  const urgency = billUrgency(daysUntilDue);
  const subtitle = tenant.unit || tenant.phone;
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
        {subtitle && (
          <p className="truncate text-[0.78rem] text-faint">{subtitle}</p>
        )}
      </div>

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
