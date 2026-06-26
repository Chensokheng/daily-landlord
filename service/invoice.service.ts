import { makeId } from "@/lib/id";
import { useAppStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";

export type InvoiceInput = Omit<Invoice, "id" | "createdAt">;

export async function listInvoices(): Promise<Invoice[]> {
  return useAppStore.getState().invoices;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  return useAppStore.getState().invoices.find((i) => i.id === id) ?? null;
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  const invoice: Invoice = { ...input, id: makeId(), createdAt: Date.now() };
  // Newest first.
  useAppStore.setState((s) => ({ invoices: [invoice, ...s.invoices] }));
  return invoice;
}

export async function updateInvoice(
  id: string,
  patch: Partial<InvoiceInput>,
): Promise<Invoice> {
  let updated: Invoice | null = null;
  useAppStore.setState((s) => ({
    invoices: s.invoices.map((i) => {
      if (i.id !== id) return i;
      updated = { ...i, ...patch };
      return updated;
    }),
  }));
  if (!updated) throw new Error(`Invoice ${id} not found`);
  return updated;
}

export async function deleteInvoice(id: string): Promise<void> {
  useAppStore.setState((s) => ({
    invoices: s.invoices.filter((i) => i.id !== id),
  }));
}
