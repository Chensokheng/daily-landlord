"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppGate } from "@/components/app/app-gate";
import { InvoiceBuilder } from "@/components/app/invoices";

function NewInvoiceRoute() {
  const router = useRouter();
  const params = useSearchParams();
  const seed = {
    tenantId: params.get("tenant") ?? undefined,
    periodKey: params.get("period") ?? undefined,
  };

  return (
    <InvoiceBuilder
      seed={seed}
      onCancel={() => router.push("/invoices")}
      onSaved={(inv) => router.replace(`/invoices/${inv.id}`)}
      onOpenInvoice={(id) => router.push(`/invoices/${id}`)}
    />
  );
}

export default function NewInvoicePage() {
  return (
    <AppGate>
      <Suspense>
        <NewInvoiceRoute />
      </Suspense>
    </AppGate>
  );
}
