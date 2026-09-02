"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { stockMovementsApi, type StockMovementInput } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useStockMovements(opts: {
  productId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.stockMovements.list(opts),
    queryFn: () => stockMovementsApi.list(opts),
  });
}

function useInvalidateAfterMovement() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.stockMovements.all });
    // Stock levels changed, so any product list/detail is now stale.
    void qc.invalidateQueries({ queryKey: queryKeys.products.all });
  };
}

export function useStockIn() {
  const invalidate = useInvalidateAfterMovement();
  return useMutation({
    mutationFn: (data: StockMovementInput) => stockMovementsApi.stockIn(data),
    onSuccess: invalidate,
  });
}

export function useStockOut() {
  const invalidate = useInvalidateAfterMovement();
  return useMutation({
    mutationFn: (data: StockMovementInput) => stockMovementsApi.stockOut(data),
    onSuccess: invalidate,
  });
}
