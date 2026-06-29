import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import * as React from "react";
import { Providers } from "@/app/providers";
import { AppGate } from "@/components/app/app-gate";
import { Billing } from "@/components/app/billing";
import { Home } from "@/components/app/home";
import {
  InvoiceBuilder,
  InvoiceList,
  InvoiceView,
} from "@/components/app/invoices";
import { Settings } from "@/components/app/settings";
import { Tenants } from "@/components/app/tenants";
import { useInvoice } from "@/hooks/use-invoices";

/* ------------------------------------------------------------------ */
/* Root — providers + onboarding/hydration gate around the outlet      */
/* ------------------------------------------------------------------ */

const rootRoute = createRootRoute({
  component: () => (
    <Providers>
      <AppGate>
        <Outlet />
      </AppGate>
    </Providers>
  ),
});

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function HomeRoute() {
    const navigate = useNavigate();
    return (
      <Home
        onOpenTenants={() => navigate({ to: "/tenants" })}
        onOpenInvoices={() => navigate({ to: "/invoices" })}
        onOpenBilling={() => navigate({ to: "/billing" })}
        onOpenSettings={() => navigate({ to: "/settings" })}
        onNewInvoice={(seed) =>
          navigate({
            to: "/invoices/new",
            search: { tenant: seed?.tenantId, period: seed?.periodKey },
          })
        }
      />
    );
  },
});

const tenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tenants",
  component: function TenantsRoute() {
    const navigate = useNavigate();
    return (
      <Tenants
        onBack={() => navigate({ to: "/" })}
        onOpenInvoices={(id) =>
          navigate({ to: "/invoices", search: { tenant: id } })
        }
      />
    );
  },
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: function BillingRoute() {
    const navigate = useNavigate();
    return (
      <Billing
        onBack={() => navigate({ to: "/" })}
        onNewInvoice={(seed) =>
          navigate({
            to: "/invoices/new",
            search: { tenant: seed?.tenantId, period: seed?.periodKey },
          })
        }
      />
    );
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: function SettingsRoute() {
    const navigate = useNavigate();
    return <Settings onBack={() => navigate({ to: "/" })} />;
  },
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  validateSearch: (s: Record<string, unknown>): { tenant?: string } => ({
    tenant: typeof s.tenant === "string" ? s.tenant : undefined,
  }),
  component: function InvoicesRoute() {
    const navigate = useNavigate();
    const { tenant } = invoicesRoute.useSearch();
    return (
      <InvoiceList
        onBack={() => navigate({ to: "/" })}
        onNew={() => navigate({ to: "/invoices/new" })}
        onOpen={(id) => navigate({ to: "/invoices/$id", params: { id } })}
        tenantId={tenant}
        onClearTenant={() => navigate({ to: "/invoices", search: {} })}
      />
    );
  },
});

const newInvoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices/new",
  validateSearch: (
    s: Record<string, unknown>,
  ): { tenant?: string; period?: string } => ({
    tenant: typeof s.tenant === "string" ? s.tenant : undefined,
    period: typeof s.period === "string" ? s.period : undefined,
  }),
  component: function NewInvoiceRoute() {
    const navigate = useNavigate();
    const { tenant, period } = newInvoiceRoute.useSearch();
    return (
      <InvoiceBuilder
        seed={{ tenantId: tenant, periodKey: period }}
        onCancel={() => navigate({ to: "/invoices" })}
        onSaved={(inv) =>
          navigate({
            to: "/invoices/$id",
            params: { id: inv.id },
            replace: true,
          })
        }
        onOpenInvoice={(id) =>
          navigate({ to: "/invoices/$id", params: { id } })
        }
      />
    );
  },
});

const invoiceViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices/$id",
  component: function InvoiceViewRoute() {
    const navigate = useNavigate();
    const { id } = invoiceViewRoute.useParams();
    const { data: invoice, isLoading } = useInvoice(id);

    React.useEffect(() => {
      if (!isLoading && !invoice) navigate({ to: "/invoices", replace: true });
    }, [isLoading, invoice, navigate]);

    if (!invoice) return null;
    return (
      <InvoiceView
        invoice={invoice}
        onBack={() => navigate({ to: "/invoices" })}
      />
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  tenantsRoute,
  billingRoute,
  settingsRoute,
  invoicesRoute,
  newInvoiceRoute,
  invoiceViewRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
