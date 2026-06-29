"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
