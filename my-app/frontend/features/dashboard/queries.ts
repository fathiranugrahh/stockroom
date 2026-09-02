"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => dashboardApi.summary(),
  });
}

export function useStockTrend(days: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.stockTrend(days),
    queryFn: () => dashboardApi.stockTrend(days),
  });
}

export function useLowStockProducts(limit = 5) {
  return useQuery({
    queryKey: queryKeys.dashboard.lowStock(limit),
    queryFn: () => dashboardApi.lowStockProducts(limit),
  });
}

export function useTopStockValue(limit = 5) {
  return useQuery({
    queryKey: queryKeys.dashboard.topValue(limit),
    queryFn: () => dashboardApi.topStockValue(limit),
  });
}
