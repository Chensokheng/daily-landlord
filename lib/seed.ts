import {
  currentMonthKey,
  defaultDueDate,
  monthKey,
  monthKeyAnchor,
  monthKeyToLabel,
  nextMonthKey,
  parseDueTs,
} from "./due";
import { makeId } from "./id";
import {
  computeInvoice,
  formatInvoiceNumber,
  type InvoiceDraft,
} from "./invoice";
import { useAppStore } from "./store";
import type { Invoice, Tenant } from "./types";

type Seed = Omit<Tenant, "id" | "createdAt" | "firstBillKey"> & {
  /** true → already settled this month, so billing nudges start next month */
  settledThisMonth?: boolean;
};

/** 20 plausible tenants — varied rent, meters and due days. */
const SEEDS: Seed[] = [
  {
    name: "Dara Kim",
    unit: "1A",
    phone: "012 345 678",
    rent: 250,
    startWater: 120,
    startElectricity: 4300,
    moveInDate: "2025-01-15",
    dueDay: 1,
    notes: "Deposit: 1 month held.",
  },
  {
    name: "Sophea Chan",
    unit: "1B",
    phone: "012 887 220",
    rent: 230,
    startWater: 88,
    startElectricity: 3910,
    moveInDate: "2025-03-02",
    dueDay: 1,
    notes: "",
  },
  {
    name: "Vichea Sok",
    unit: "2A",
    phone: "078 412 905",
    rent: 280,
    startWater: 210,
    startElectricity: 5120,
    moveInDate: "2024-11-20",
    dueDay: 5,
    notes: "",
  },
  {
    name: "Bopha Ly",
    unit: "2B",
    phone: "010 332 118",
    rent: 260,
    startWater: 64,
    startElectricity: 2870,
    moveInDate: "2025-06-01",
    dueDay: 5,
    notes: "Pays via ABA.",
  },
  {
    name: "Rithy Pich",
    unit: "3A",
    phone: "096 770 441",
    rent: 300,
    startWater: 145,
    startElectricity: 6010,
    moveInDate: "2024-08-10",
    dueDay: 10,
    notes: "",
  },
  {
    name: "Channary Meas",
    unit: "3B",
    phone: "012 559 803",
    rent: 245,
    startWater: 99,
    startElectricity: 4480,
    moveInDate: "2025-02-18",
    dueDay: 10,
    notes: "",
  },
  {
    name: "Sokha Nuon",
    unit: "4A",
    phone: "081 204 776",
    rent: 275,
    startWater: 132,
    startElectricity: 5300,
    moveInDate: "2025-04-05",
    dueDay: 15,
    notes: "Late payer — nudge early.",
    settledThisMonth: true,
  },
  {
    name: "Phalla Ros",
    unit: "4B",
    phone: "070 918 332",
    rent: 255,
    startWater: 71,
    startElectricity: 3120,
    moveInDate: "2025-05-22",
    dueDay: 15,
    notes: "",
  },
  {
    name: "Vannak Heng",
    unit: "5A",
    phone: "012 663 091",
    rent: 320,
    startWater: 188,
    startElectricity: 6740,
    moveInDate: "2024-09-30",
    dueDay: 20,
    notes: "",
  },
  {
    name: "Theary Khoun",
    unit: "5B",
    phone: "017 442 508",
    rent: 265,
    startWater: 103,
    startElectricity: 4015,
    moveInDate: "2025-01-08",
    dueDay: 20,
    notes: "",
  },
  {
    name: "Makara Sambath",
    unit: "6A",
    phone: "098 117 640",
    rent: 290,
    startWater: 156,
    startElectricity: 5580,
    moveInDate: "2024-12-12",
    dueDay: 25,
    notes: "Runs a small shop in front.",
  },
  {
    name: "Sreypov Eng",
    unit: "6B",
    phone: "012 005 773",
    rent: 240,
    startWater: 82,
    startElectricity: 3640,
    moveInDate: "2025-03-19",
    dueDay: 25,
    notes: "",
  },
  {
    name: "Chanthou Prak",
    unit: "7A",
    phone: "086 330 219",
    rent: 310,
    startWater: 174,
    startElectricity: 6230,
    moveInDate: "2024-10-04",
    dueDay: 1,
    notes: "",
  },
  {
    name: "Davy Sann",
    unit: "7B",
    phone: "069 781 452",
    rent: 250,
    startWater: 95,
    startElectricity: 4190,
    moveInDate: "2025-06-15",
    dueDay: 1,
    notes: "Just moved in.",
    settledThisMonth: true,
  },
  {
    name: "Pisey Tep",
    unit: "8A",
    phone: "012 448 907",
    rent: 285,
    startWater: 141,
    startElectricity: 5470,
    moveInDate: "2024-07-28",
    dueDay: 5,
    notes: "",
  },
  {
    name: "Kosal Yim",
    unit: "8B",
    phone: "077 612 340",
    rent: 270,
    startWater: 110,
    startElectricity: 4860,
    moveInDate: "2025-02-01",
    dueDay: 5,
    notes: "",
  },
  {
    name: "Sothea Mom",
    unit: "9A",
    phone: "015 209 884",
    rent: 295,
    startWater: 163,
    startElectricity: 5905,
    moveInDate: "2024-11-11",
    dueDay: 12,
    notes: "Two occupants.",
  },
  {
    name: "Maly Chea",
    unit: "9B",
    phone: "012 778 015",
    rent: 235,
    startWater: 77,
    startElectricity: 3380,
    moveInDate: "2025-05-09",
    dueDay: 12,
    notes: "",
  },
  {
    name: "Narin Hor",
    unit: "10A",
    phone: "088 904 221",
    rent: 330,
    startWater: 201,
    startElectricity: 7020,
    moveInDate: "2024-06-25",
    dueDay: 28,
    notes: "Corner unit, larger.",
  },
  {
    name: "Chenda Ouk",
    unit: "10B",
    phone: "071 553 098",
    rent: 260,
    startWater: 90,
    startElectricity: 4025,
    moveInDate: "2025-04-17",
    dueDay: 28,
    notes: "",
  },
];

/**
 * Populate the store with mock tenants. By default replaces existing tenants;
 * pass `{ append: true }` to add alongside them. Returns the inserted records.
 */
export function seedMockTenants({ append = false } = {}): Tenant[] {
  const now = Date.now();
  const day = 86_400_000;
  const tenants: Tenant[] = SEEDS.map(({ settledThisMonth, ...t }, i) => ({
    ...t,
    id: makeId(),
    // Stagger createdAt so list ordering looks natural (oldest first).
    createdAt: now - (SEEDS.length - i) * day,
    firstBillKey: settledThisMonth ? nextMonthKey(now) : currentMonthKey(now),
  }));

  useAppStore.setState((s) => ({
    onboarded: true,
    tenants: append ? [...s.tenants, ...tenants] : tenants,
  }));

  return tenants;
}

/**
 * Build a back-history of invoices for the current tenants — `months` worth
 * each, with realistic line items, rising meter readings and a paid/overdue
 * mix. Replaces existing invoices. Use to preview the list with real volume.
 */
export function seedMockInvoices({ months = 6 } = {}): Invoice[] {
  const { config, tenants } = useAppStore.getState();
  if (tenants.length === 0) return [];

  const now = Date.now();
  const today = new Date(now);

  // Oldest → newest billing months (excluding the current one).
  const monthKeys: string[] = [];
  for (let back = months; back >= 1; back--) {
    monthKeys.push(
      monthKey(new Date(today.getFullYear(), today.getMonth() - back, 1)),
    );
  }

  const invoices: Omit<Invoice, "number">[] = [];

  tenants.forEach((tenant, ti) => {
    // Walk readings forward from the tenant's baseline so each period's
    // "previous" is the prior period's "current".
    let water = tenant.startWater;
    let elec = tenant.startElectricity;

    monthKeys.forEach((mk, idx) => {
      const waterUse = 6 + ((ti + idx) % 6) * 2; // ~6–16 units
      const elecUse = 90 + ((ti * 2 + idx) % 8) * 28; // ~90–286 units

      const draft: InvoiceDraft = {
        periodLabel: monthKeyToLabel(mk),
        includeRent: true,
        water: { previous: water, current: water + waterUse },
        electricity: { previous: elec, current: elec + elecUse },
      };
      const computed = computeInvoice(config, tenant, draft);
      water += waterUse;
      elec += elecUse;

      const dueDate = defaultDueDate(tenant, monthKeyAnchor(mk));
      // Issued a few days into the billing month.
      const createdAt = monthKeyAnchor(mk) + 4 * 86_400_000;
      // History is mostly settled; ~1 in 3 of the last two months left unpaid.
      const recent = idx >= monthKeys.length - 2;
      const unpaid = recent && (ti + idx) % 3 === 0;
      const paidAt = unpaid ? null : parseDueTs(dueDate);

      invoices.push({
        id: makeId(),
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantUnit: tenant.unit,
        createdAt,
        periodLabel: draft.periodLabel,
        periodKey: mk,
        dueDate,
        paidAt,
        lines: computed.lines,
        total: computed.total,
        readings: computed.readings,
      });
    });
  });

  // Newest first, matching createInvoice's ordering.
  invoices.sort((a, b) => b.createdAt - a.createdAt);
  // Number them oldest → newest so the sequence tracks creation order.
  const numbered: Invoice[] = invoices.map((inv, i) => ({
    ...inv,
    number: formatInvoiceNumber(invoices.length - i),
  }));
  useAppStore.setState({ invoices: numbered });
  return numbered;
}
