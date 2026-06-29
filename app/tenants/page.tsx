"use client";

import { useRouter } from "next/navigation";
import { AppGate } from "@/components/app/app-gate";
import { Tenants } from "@/components/app/tenants";

export default function TenantsPage() {
  const router = useRouter();
  return (
    <AppGate>
      <Tenants
        onBack={() => router.push("/")}
        onOpenInvoices={(tenantId) =>
          router.push(`/invoices?tenant=${tenantId}`)
        }
      />
    </AppGate>
  );
}
