"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppGate } from "@/components/app/app-gate";
import { InvoiceList } from "@/components/app/invoices";

function InvoicesRoute() {
  const router = useRouter();
  const params = useSearchParams();
  const tenantId = params.get("tenant") ?? undefined;

  return (
    <InvoiceList
      onBack={() => router.push("/")}
      onNew={() => router.push("/invoices/new")}
      onOpen={(id) => router.push(`/invoices/${id}`)}
      tenantId={tenantId}
      onClearTenant={() => router.push("/invoices")}
    />
  );
}

export default function InvoicesPage() {
  return (
    <AppGate>
      <Suspense>
        <InvoicesRoute />
      </Suspense>
    </AppGate>
  );
}
