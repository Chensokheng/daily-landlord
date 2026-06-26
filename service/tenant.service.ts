import { makeId } from "@/lib/id";
import { useAppStore } from "@/lib/store";
import type { Tenant } from "@/lib/types";

export type TenantInput = Omit<Tenant, "id" | "createdAt">;

export async function listTenants(): Promise<Tenant[]> {
  return useAppStore.getState().tenants;
}

export async function getTenant(id: string): Promise<Tenant | null> {
  return useAppStore.getState().tenants.find((t) => t.id === id) ?? null;
}

export async function createTenant(input: TenantInput): Promise<Tenant> {
  const tenant: Tenant = { ...input, id: makeId(), createdAt: Date.now() };
  useAppStore.setState((s) => ({ tenants: [...s.tenants, tenant] }));
  return tenant;
}

export async function updateTenant(
  id: string,
  patch: Partial<TenantInput>,
): Promise<Tenant> {
  let updated: Tenant | null = null;
  useAppStore.setState((s) => ({
    tenants: s.tenants.map((t) => {
      if (t.id !== id) return t;
      updated = { ...t, ...patch };
      return updated;
    }),
  }));
  if (!updated) throw new Error(`Tenant ${id} not found`);
  return updated;
}

export async function deleteTenant(id: string): Promise<void> {
  useAppStore.setState((s) => ({
    tenants: s.tenants.filter((t) => t.id !== id),
  }));
}
