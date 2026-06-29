import type {
  Config,
  Invoice,
  InvoiceLine,
  MeterReading,
  Tenant,
  UtilityConfig,
} from "./types";
import { formatQty, formatUSD } from "./utils";

/** Prefix for generated invoice numbers, e.g. "INV-0007". */
const INVOICE_PREFIX = "INV-";

/** Render a 1-based sequence as a zero-padded invoice number. */
export function formatInvoiceNumber(seq: number): string {
  return `${INVOICE_PREFIX}${String(seq).padStart(4, "0")}`;
}

/**
 * Next sequential invoice number, one past the highest already in use. Parsing
 * the existing numbers (rather than counting) keeps numbers stable when an
 * invoice is deleted — we never hand out the same number twice.
 */
export function nextInvoiceNumber(invoices: Pick<Invoice, "number">[]): string {
  let max = 0;
  for (const inv of invoices) {
    const n = Number.parseInt(
      inv.number?.replace(INVOICE_PREFIX, "") ?? "",
      10,
    );
    if (Number.isFinite(n) && n > max) max = n;
  }
  return formatInvoiceNumber(max + 1);
}

/** What the builder collects before we turn it into a saved Invoice. */
export interface InvoiceDraft {
  periodLabel: string;
  includeRent: boolean;
  water: MeterReading;
  electricity: MeterReading;
  /** Config extra-fee ids to drop from this invoice (default: include all). */
  excludedExtraIds?: string[];
}

export interface ComputedInvoice {
  lines: InvoiceLine[];
  total: number;
  readings: Invoice["readings"];
}

function meteredLine(
  name: string,
  u: UtilityConfig,
  reading: MeterReading,
): InvoiceLine {
  const usage = Math.max(0, reading.current - reading.previous);
  return {
    label: name,
    detail: `${formatQty(usage)} ${u.unit} × ${formatUSD(u.rate)}`,
    amount: usage * u.rate,
  };
}

function utilityLine(
  name: string,
  u: UtilityConfig,
  reading: MeterReading,
): { line: InvoiceLine; reading?: MeterReading } | null {
  if (!u.enabled) return null;
  if (u.mode === "flat") {
    return {
      line: { label: name, detail: "Flat fee", amount: u.flatAmount },
    };
  }
  return { line: meteredLine(name, u, reading), reading };
}

/** Build invoice line items + total from the landlord config, a tenant, and the draft. */
export function computeInvoice(
  config: Config,
  tenant: Tenant,
  draft: InvoiceDraft,
): ComputedInvoice {
  const lines: InvoiceLine[] = [];
  const readings: Invoice["readings"] = {};

  if (draft.includeRent && tenant.rent > 0) {
    lines.push({ label: "Rent", amount: tenant.rent });
  }

  const water = utilityLine("Water", config.water, draft.water);
  if (water) {
    lines.push(water.line);
    if (water.reading) readings.water = water.reading;
  }

  const elec = utilityLine(
    "Electricity",
    config.electricity,
    draft.electricity,
  );
  if (elec) {
    lines.push(elec.line);
    if (elec.reading) readings.electricity = elec.reading;
  }

  const excluded = new Set(draft.excludedExtraIds ?? []);
  for (const extra of config.extras) {
    if (excluded.has(extra.id)) continue;
    lines.push({ label: extra.name, amount: extra.amount });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total, readings };
}

/** Default "previous" reading: the last invoice's current value, else the tenant baseline. */
export function previousReadings(
  tenant: Tenant,
  invoices: Invoice[],
): { water: number; electricity: number } {
  const last = invoices
    .filter((inv) => inv.tenantId === tenant.id)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  return {
    water: last?.readings.water?.current ?? tenant.startWater,
    electricity: last?.readings.electricity?.current ?? tenant.startElectricity,
  };
}
