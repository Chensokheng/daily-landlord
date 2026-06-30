import * as React from "react";
import { useAppStore } from "./store";
import type { Lang } from "./types";

export type { Lang } from "./types";

export const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "km", label: "ខ្មែរ" },
];

/**
 * Khmer translations keyed by the English source string. Anything missing
 * falls back to English, so the UI is never broken mid-translation. Use
 * `{name}`-style placeholders for interpolation.
 */
const km: Record<string, string> = {
  // Nav / common
  Tenants: "អ្នកជួល",
  Invoices: "វិក្កយបត្រ",
  "To bill": "ត្រូវចេញវិក្កយបត្រ",
  Settings: "ការកំណត់",
  Back: "ត្រឡប់",
  Cancel: "បោះបង់",
  Delete: "លុប",
  Edit: "កែសម្រួល",

  // Home
  "Hi, {name}.": "សួស្តី {name}។",
  "To bill this month": "ត្រូវចេញវិក្កយបត្រខែនេះ",
  "All clear this month": "អស់ហើយខែនេះ",
  "Every tenant due this cycle has been billed.":
    "អ្នកជួលទាំងអស់ដែលត្រូវបង់ក្នុងវដ្តនេះ បានចេញវិក្កយបត្ររួចហើយ។",
  "Needs attention": "ត្រូវការការយកចិត្តទុកដាក់",
  "{n} overdue": "ហួសកំណត់ {n}",
  "{n} due soon": "ជិតដល់ {n}",
  "Add a tenant": "បន្ថែមអ្នកជួល",
  "Manage tenants": "គ្រប់គ្រងអ្នកជួល",
  "Name, phone & their monthly rent": "ឈ្មោះ ទូរស័ព្ទ និងថ្លៃជួលប្រចាំខែ",
  "{count} tenant — tap to view or add": "{count} អ្នកជួល — ចុចដើម្បីមើល ឬបន្ថែម",
  "{count} tenants — tap to view or add": "{count} អ្នកជួល — ចុចដើម្បីមើល ឬបន្ថែម",
  "Generate an invoice": "បង្កើតវិក្កយបត្រ",
  "Enter readings & send in seconds": "បញ្ចូលលេខម៉ែត្រ ហើយផ្ញើក្នុងពេលប៉ុន្មានវិនាទី",
  "Add a tenant first": "សូមបន្ថែមអ្នកជួលជាមុនសិន",
  "Your rates": "តម្លៃរបស់អ្នក",
  Water: "ទឹក",
  Electricity: "អគ្គិសនី",
  "Payment QR": "QR ទូទាត់",
  "Shown on every invoice so tenants can scan and pay you directly.":
    "បង្ហាញលើវិក្កយបត្រនីមួយៗ ដើម្បីឲ្យអ្នកជួលស្កេន និងបង់ប្រាក់ដោយផ្ទាល់។",
  "Everything stays on this device.": "ទិន្នន័យទាំងអស់រក្សាក្នុងឧបករណ៍នេះ។",
  "View all {n} to bill": "មើលទាំងអស់ {n} ត្រូវចេញវិក្កយបត្រ",
  Edit_rates: "កែតម្លៃ",

  // Bill-todo rows
  "Unit {n}": "ឯកតា {n}",
  "Ready to bill": "រួចចេញវិក្កយបត្រ",
  "{n}d late": "យឺត {n} ថ្ងៃ",
  "due today": "ផុតថ្ងៃនេះ",
  "in {n}d": "ក្នុង {n} ថ្ងៃ",

  // Tenants
  "No tenants yet": "មិនទាន់មានអ្នកជួល",
  "Add the people you bill. Their rent and meter baselines feed straight into invoices.":
    "បន្ថែមអ្នកដែលអ្នកចេញវិក្កយបត្រ។ ថ្លៃជួល និងលេខម៉ែត្រដំបូងនឹងបញ្ចូលទៅវិក្កយបត្រដោយស្វ័យប្រវត្តិ។",
  "Add your first tenant": "បន្ថែមអ្នកជួលដំបូង",
  "Add tenant": "បន្ថែមអ្នកជួល",
  Active: "សកម្ម",
  "Moved out": "បានចេញ",
  All: "ទាំងអស់",
  Reactivate: "បើកឡើងវិញ",
  "No moved-out tenants.": "គ្មានអ្នកជួលដែលបានចេញ។",
  "No tenants here.": "គ្មានអ្នកជួលនៅទីនេះ។",
  "rent / mo": "ជួល/ខែ",
  "New tenant": "អ្នកជួលថ្មី",
  "Edit tenant": "កែព័ត៌មានអ្នកជួល",
  Name: "ឈ្មោះ",
  "Room / unit": "បន្ទប់/ឯកតា",
  "Monthly rent": "ថ្លៃជួលប្រចាំខែ",
  Phone: "ទូរស័ព្ទ",
  "Move-in date": "ថ្ងៃចូលរស់នៅ",
  "Rent due day": "ថ្ងៃត្រូវបង់ថ្លៃជួល",
  Notes: "កំណត់ចំណាំ",
  optional: "ស្រេចចិត្ត",
  required: "ត្រូវការ",
  "Save tenant": "រក្សាទុកអ្នកជួល",
  "Save changes": "រក្សាទុកការផ្លាស់ប្ដូរ",
  "Starting meter readings": "លេខម៉ែត្រដំបូង",
  "Already paid for this month": "បានបង់សម្រាប់ខែនេះហើយ",
  "Start the billing reminder next month instead.":
    "ចាប់ផ្ដើមរំលឹកការចេញវិក្កយបត្រនៅខែក្រោយវិញ។",
  "Delete tenant?": "លុបអ្នកជួល?",
  "Mark as moved out?": "សម្គាល់ថាបានចេញ?",
  "Move out": "ឲ្យចេញ",
  "{name} will be removed for good. Past invoices stay. Can't be undone.":
    "{name} នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។ វិក្កយបត្រចាស់នៅដដែល។ មិនអាចត្រឡប់វិញបានទេ។",
  "{name} will stop showing in To bill. You can reactivate anytime.":
    "{name} នឹងលែងបង្ហាញក្នុង ត្រូវចេញវិក្កយបត្រ។ អ្នកអាចបើកឡើងវិញពេលណាក៏បាន។",

  // Billing / To bill
  Overdue: "ហួសកំណត់",
  "Due soon": "ជិតដល់",
  Upcoming: "នាពេលខាងមុខ",
  "Search name, unit or phone": "ស្វែងរក ឈ្មោះ ឯកតា ឬទូរស័ព្ទ",
  "No matches": "គ្មានលទ្ធផល",
  "All caught up": "អស់ហើយ",
  "Try a different search.": "សាកល្បងស្វែងរកផ្សេង។",
  "Every tenant due this cycle has been billed. Nice work.":
    "អ្នកជួលគ្រប់រូបនៃវដ្តនេះត្រូវបានចេញវិក្កយបត្រហើយ។ ល្អណាស់។",

  // Settings
  "About you": "អំពីអ្នក",
  "Water & electricity": "ទឹក និងអគ្គិសនី",
  "Other charges": "ការគិតថ្លៃផ្សេងៗ",
  Language: "ភាសា",
  "Your data": "ទិន្នន័យរបស់អ្នក",
  "Export all data": "នាំចេញទិន្នន័យទាំងអស់",
  "Saves a JSON backup of your settings, {tenants} tenants and {invoices} invoices. Everything stays on this device.":
    "រក្សាទុកច្បាប់ចម្លង JSON នៃការកំណត់ អ្នកជួល {tenants} នាក់ និងវិក្កយបត្រ {invoices}។ ទិន្នន័យទាំងអស់រក្សាក្នុងឧបករណ៍នេះ។",
  "Danger zone": "តំបន់គ្រោះថ្នាក់",
  "Reset everything": "កំណត់ឡើងវិញទាំងអស់",
  "Clears all tenants, invoices and settings on this device.":
    "លុបអ្នកជួល វិក្កយបត្រ និងការកំណត់ទាំងអស់នៅលើឧបករណ៍នេះ។",

  // Invoices
  "New invoice": "វិក្កយបត្រថ្មី",
  "No invoices yet": "មិនទាន់មានវិក្កយបត្រ",
  Unpaid: "មិនទាន់បង់",
  Paid: "បានបង់",
  "All months": "ខែទាំងអស់",
  "Invoices for": "វិក្កយបត្ររបស់",
  "Try a different search or filter.": "សាកល្បងស្វែងរក ឬតម្រងផ្សេង។",
  "{name} has no invoices yet.": "{name} មិនទាន់មានវិក្កយបត្រ។",
  "Punch in this month's meter readings and Tally builds the invoice for you.":
    "បញ្ចូលលេខម៉ែត្រខែនេះ ហើយ Tally នឹងបង្កើតវិក្កយបត្រឲ្យអ្នក។",
  "Add a tenant first — then you can generate their invoice here.":
    "បន្ថែមអ្នកជួលជាមុនសិន — បន្ទាប់មកអ្នកអាចបង្កើតវិក្កយបត្ររបស់ពួកគេនៅទីនេះ។",
  "Search tenant or unit": "ស្វែងរក អ្នកជួល ឬឯកតា",
  "Search name, unit or invoice no.": "ស្វែងរក ឈ្មោះ ឯកតា ឬលេខវិក្កយបត្រ",
  "Select tenant": "ជ្រើសរើសអ្នកជួល",
  "Billing month": "ខែចេញវិក្កយបត្រ",
  "Due date": "ថ្ងៃផុតកំណត់",
  "Meter readings": "លេខម៉ែត្រ",
  Previous: "មុន",
  Current: "បច្ចុប្បន្ន",
  "Include rent": "រួមបញ្ចូលថ្លៃជួល",
  "Invoice total": "សរុបវិក្កយបត្រ",
  "Review invoice": "ពិនិត្យវិក្កយបត្រ",
  Preview: "មើលជាមុន",
  "Save invoice": "រក្សាទុកវិក្កយបត្រ",
  "Save & mark paid": "រក្សាទុក និងសម្គាល់ថាបានបង់",
  "Keep editing": "បន្តកែសម្រួល",
  "Mark as paid": "សម្គាល់ថាបានបង់",
  "Mark as unpaid": "សម្គាល់ថាមិនទាន់បង់",
  "Share / download": "ចែករំលែក / ទាញយក",
  "Chat on Telegram": "ជជែកតាម Telegram",
  Invoice: "វិក្កយបត្រ",
  "Delete invoice?": "លុបវិក្កយបត្រ?",
  Tenant: "អ្នកជួល",
  Billed: "បានចេញវិក្កយបត្រ",
  "No tenants match.": "គ្មានអ្នកជួលត្រូវគ្នា។",
  "This invoice for": "វិក្កយបត្រនេះសម្រាប់",
  "will be removed. This can't be undone.": "នឹងត្រូវលុបចេញ។ មិនអាចត្រឡប់វិញបានទេ។",

  // PWA
  "Update available": "មានកំណែថ្មី",
  Reload: "ផ្ទុកឡើងវិញ",
};

const dicts: Record<Lang, Record<string, string>> = { en: {}, km };

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  let out = (lang !== "en" && dicts[lang][key]) || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}

/** Current UI language (reactive). */
export function useLang(): Lang {
  return useAppStore((s) => s.lang);
}

/** Switch language — persists with the rest of the store. */
export function setLang(lang: Lang) {
  useAppStore.setState({ lang });
}

/** A translate function bound to the current language. */
export function useT() {
  const lang = useLang();
  return React.useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang],
  );
}
