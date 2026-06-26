import type {
  Config,
  Invoice,
  InvoiceLine,
  MeterReading,
  Tenant,
  UtilityConfig,
} from "./types";
import { formatQty, formatUSD } from "./utils";

/** What the builder collects before we turn it into a saved Invoice. */
export interface InvoiceDraft {
  periodLabel: string;
  includeRent: boolean;
  water: MeterReading;
  electricity: MeterReading;
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

  for (const extra of config.extras) {
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
