export type UtilityMode = "metered" | "flat";

export interface UtilityConfig {
  /** Whether this utility appears on invoices at all */
  enabled: boolean;
  /** "metered" → charge per unit consumed; "flat" → fixed amount each cycle */
  mode: UtilityMode;
  /** Price per unit, in USD, used when metered (e.g. 0.25 / kWh) */
  rate: number;
  /** Unit label shown on the invoice (kWh, m³, …) */
  unit: string;
  /** Fixed amount, in USD, used when flat */
  flatAmount: number;
}

export interface ExtraFee {
  id: string;
  name: string;
  amount: number;
}

export interface LandlordProfile {
  name: string;
  property: string;
  phone: string;
}

export interface Config {
  profile: LandlordProfile;
  water: UtilityConfig;
  electricity: UtilityConfig;
  extras: ExtraFee[];
  /** Landlord payment QR (e.g. bank/wallet), stored as a data URL. Shown on invoices so tenants can pay. Empty = none set. */
  paymentQr: string;
  currency: "USD";
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  unit: string;
  rent: number;
  createdAt: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  createdAt: number;
  periodLabel: string;
  lines: { label: string; detail?: string; amount: number }[];
  total: number;
}

export interface AppState {
  onboarded: boolean;
  config: Config;
  tenants: Tenant[];
  invoices: Invoice[];
}

export const defaultConfig: Config = {
  profile: { name: "", property: "", phone: "" },
  water: {
    enabled: true,
    mode: "metered",
    rate: 0.3,
    unit: "m³",
    flatAmount: 5,
  },
  electricity: {
    enabled: true,
    mode: "metered",
    rate: 0.25,
    unit: "kWh",
    flatAmount: 15,
  },
  extras: [{ id: "trash", name: "Trash collection", amount: 2 }],
  paymentQr: "",
  currency: "USD",
};

export const defaultState: AppState = {
  onboarded: false,
  config: defaultConfig,
  tenants: [],
  invoices: [],
};
