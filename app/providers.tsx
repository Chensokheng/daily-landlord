

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { PwaManager } from "@/components/app/pwa";
import { seedMockInvoices, seedMockTenants } from "@/lib/seed";

export function Providers({ children }: { children: React.ReactNode }) {
  // Dev-only: expose `seedTally()` / `seedInvoices()` in the browser console.
  // Reload after running so React Query picks up the new data.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const w = window as unknown as {
        seedTally: typeof seedMockTenants;
        seedInvoices: typeof seedMockInvoices;
      };
      w.seedTally = seedMockTenants;
      w.seedInvoices = seedMockInvoices;
    }
  }, []);

  // Entrance animations run once on the first load; drop the gate afterward so
  // client-side navigation (incl. back) doesn't replay them.
  React.useEffect(() => {
    const t = window.setTimeout(
      () => document.documentElement.classList.remove("first-load"),
      700,
    );
    return () => window.clearTimeout(t);
  }, []);

  // The "server" here is localStorage, so data only changes via our own
  // mutations (which invalidate) — never refetch on focus, never retry.
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <PwaManager />
    </QueryClientProvider>
  );
}
