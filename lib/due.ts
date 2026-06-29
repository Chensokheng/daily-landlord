import type { Invoice, Tenant } from "./types";

/** Within this many days of the due date counts as "due soon". */
export const DUE_SOON_DAYS = 3;
/** Fallback grace period (days after issue) when a tenant has no fixed due day. */
export const DEFAULT_GRACE_DAYS = 7;
/** How many days before the due day a tenant starts showing as "to bill". */
export const BILL_LEAD_DAYS = 5;

export type InvoiceStatus = "paid" | "overdue" | "due-soon" | "upcoming";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** "yyyy-mm" key for a date. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function currentMonthKey(now: number): string {
  return monthKey(new Date(now));
}

/** The "yyyy-mm" key for the month after `now`. */
export function nextMonthKey(now: number): string {
  const d = new Date(now);
  return monthKey(new Date(d.getFullYear(), d.getMonth() + 1, 1));
}

/** First-of-month timestamp for a "yyyy-mm" key. */
export function monthKeyAnchor(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).getTime();
}

/** "June 2026" from a "yyyy-mm" key. */
export function monthKeyToLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, (m || 1) - 1, 1));
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Parse an ISO yyyy-mm-dd as a local-midnight timestamp. */
export function parseDueTs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

/**
 * Default due date for a new invoice: the tenant's fixed due day applied to the
 * issue month, or — if they have none — a grace period after the issue date.
 */
export function defaultDueDate(
  tenant: Tenant | undefined,
  issueTs: number,
): string {
  const issue = new Date(issueTs);
  if (tenant && tenant.dueDay >= 1) {
    const day = Math.min(
      tenant.dueDay,
      daysInMonth(issue.getFullYear(), issue.getMonth()),
    );
    return toISODate(new Date(issue.getFullYear(), issue.getMonth(), day));
  }
  const d = new Date(issueTs);
  d.setDate(d.getDate() + DEFAULT_GRACE_DAYS);
  return toISODate(d);
}

/** Whole days until due (negative = overdue) relative to `now`. */
export function daysUntilDue(inv: Invoice, now: number): number {
  if (!inv.dueDate) return Number.POSITIVE_INFINITY;
  return Math.round(
    (startOfDay(parseDueTs(inv.dueDate)) - startOfDay(now)) / 86_400_000,
  );
}

export function invoiceStatus(inv: Invoice, now: number): InvoiceStatus {
  if (inv.paidAt) return "paid";
  const days = daysUntilDue(inv, now);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due-soon";
  return "upcoming";
}

/** Short human label for a badge, e.g. "Overdue 4d", "Due today", "Paid". */
export function statusLabel(inv: Invoice, now: number): string {
  const status = invoiceStatus(inv, now);
  if (status === "paid") return "Paid";
  const days = daysUntilDue(inv, now);
  if (status === "overdue") return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  return `Due in ${days}d`;
}

export interface AttentionItem {
  invoice: Invoice;
  status: InvoiceStatus;
  days: number;
}

/** Unpaid invoices that are overdue or due soon, most-urgent first. */
export function attentionItems(
  invoices: Invoice[],
  now: number,
): AttentionItem[] {
  return invoices
    .map((invoice) => ({
      invoice,
      status: invoiceStatus(invoice, now),
      days: daysUntilDue(invoice, now),
    }))
    .filter((x) => x.status === "overdue" || x.status === "due-soon")
    .sort((a, b) => a.days - b.days);
}

export interface BillTodo {
  tenant: Tenant;
  monthKey: string;
  /** Days until this month's due day (negative = the bill is already late). */
  daysUntilDue: number;
}

/**
 * Tenants who are due to be billed this cycle but have no invoice for the
 * current month yet — the "collect readings & generate" reminder. A tenant
 * enters the list once today reaches `dueDay − BILL_LEAD_DAYS`.
 */
export function billingTodos(
  tenants: Tenant[],
  invoices: Invoice[],
  now: number,
): BillTodo[] {
  const key = currentMonthKey(now);
  const today = new Date(now);
  const dom = today.getDate();
  const monthDays = daysInMonth(today.getFullYear(), today.getMonth());

  return (
    tenants
      // Has a cycle, and Tally has started billing them by this month.
      .filter((t) => t.dueDay >= 1 && key >= (t.firstBillKey || key))
      .map((t) => {
        const effectiveDue = Math.min(t.dueDay, monthDays);
        return { tenant: t, effectiveDue };
      })
      .filter(
        ({ effectiveDue }) => dom >= Math.max(1, effectiveDue - BILL_LEAD_DAYS),
      )
      .filter(
        ({ tenant }) =>
          !invoices.some(
            (inv) => inv.tenantId === tenant.id && inv.periodKey === key,
          ),
      )
      .map(({ tenant, effectiveDue }) => ({
        tenant,
        monthKey: key,
        daysUntilDue: effectiveDue - dom,
      }))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  );
}
