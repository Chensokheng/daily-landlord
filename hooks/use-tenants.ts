

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/service/tenant.service";

export const tenantKeys = {
  all: ["tenants"] as const,
  detail: (id: string) => ["tenants", id] as const,
};

export function useTenants() {
  return useQuery({ queryKey: tenantKeys.all, queryFn: svc.listTenants });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => svc.getTenant(id),
    enabled: Boolean(id),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createTenant,
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<svc.TenantInput>;
    }) => svc.updateTenant(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteTenant,
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
