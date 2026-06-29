"use client";

import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { AppGate } from "@/components/app/app-gate";
import { InvoiceView } from "@/components/app/invoices";
import { useInvoice } from "@/hooks/use-invoices";

function ViewInvoiceRoute() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id);

  // Invoice was deleted or the id is bogus — send them back to the list.
  React.useEffect(() => {
    if (!isLoading && !invoice) router.replace("/invoices");
  }, [isLoading, invoice, router]);

  if (!invoice) return null;

  return (
    <InvoiceView invoice={invoice} onBack={() => router.push("/invoices")} />
  );
}

export default function InvoiceViewPage() {
  return (
    <AppGate>
      <ViewInvoiceRoute />
    </AppGate>
  );
}
