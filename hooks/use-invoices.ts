"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/service/invoice.service";

export const invoiceKeys = {
  all: ["invoices"] as const,
  detail: (id: string) => ["invoices", id] as const,
};

export function useInvoices() {
  return useQuery({ queryKey: invoiceKeys.all, queryFn: svc.listInvoices });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => svc.getInvoice(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<svc.InvoiceInput>;
    }) => svc.updateInvoice(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
  });
}
