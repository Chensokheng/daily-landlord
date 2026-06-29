"use client";

import { useRouter } from "next/navigation";
import { AppGate } from "@/components/app/app-gate";
import { Billing } from "@/components/app/billing";
import type { InvoiceSeed } from "@/components/app/invoices";

function newInvoiceHref(seed?: InvoiceSeed): string {
  const p = new URLSearchParams();
  if (seed?.tenantId) p.set("tenant", seed.tenantId);
  if (seed?.periodKey) p.set("period", seed.periodKey);
  const qs = p.toString();
  return qs ? `/invoices/new?${qs}` : "/invoices/new";
}

export default function BillingPage() {
  const router = useRouter();
  return (
    <AppGate>
      <Billing
        onBack={() => router.push("/")}
        onNewInvoice={(seed) => router.push(newInvoiceHref(seed))}
      />
    </AppGate>
  );
}
