"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { suppliersApi, type SupplierInput } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.list(),
    queryFn: () => suppliersApi.list(),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierInput) => suppliersApi.create(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierInput> }) =>
      suppliersApi.update(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
  });
}
