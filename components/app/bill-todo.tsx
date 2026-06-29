

import { ChevronRight, DoorOpen, Phone, Send } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { Tenant } from "@/lib/types";
import { telegramHref } from "@/lib/utils";

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
  const t = useT();
  const urgency = billUrgency(daysUntilDue);
  const telegram = telegramHref(tenant.phone);
  const dueLabel =
    daysUntilDue < 0
      ? t("{n}d late", { n: Math.abs(daysUntilDue) })
      : daysUntilDue === 0
        ? t("due today")
        : t("in {n}d", { n: daysUntilDue });
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
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.78rem] text-faint">
          {tenant.unit ? (
            <>
              <DoorOpen className="size-3 shrink-0" />
              {t("Unit {n}", { n: tenant.unit })}
            </>
          ) : tenant.phone ? (
            <>
              <Phone className="size-3 shrink-0" />
              {tenant.phone}
            </>
          ) : (
            t("Ready to bill")
          )}
        </p>
      </div>

      {telegram && (
        <a
          href={telegram}
          target="_blank"
          rel="noreferrer"
          className="pressable relative z-10 grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-[#229ED9] hover:bg-secondary"
          aria-label={`Message ${tenant.name} on Telegram`}
        >
          <Send className="size-4" />
        </a>
      )}

      <span
        className={`nums shrink-0 text-[0.78rem] font-semibold ${badgeTone}`}
      >
        {dueLabel}
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
