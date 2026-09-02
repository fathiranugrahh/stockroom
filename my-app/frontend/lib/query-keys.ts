import type { AuditQuery, ProductQuery } from "@/lib/api";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params: ProductQuery) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => ["categories", "list"] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: () => ["suppliers", "list"] as const,
  },
  stockMovements: {
    all: ["stock-movements"] as const,
    list: (params: { productId?: string; page?: number; limit?: number }) =>
      ["stock-movements", "list", params] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: { page?: number; limit?: number }) =>
      ["users", "list", params] as const,
  },
  auditLogs: {
    all: ["audit-logs"] as const,
    list: (params: AuditQuery) => ["audit-logs", "list", params] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => ["dashboard", "summary"] as const,
    stockTrend: (days: number) => ["dashboard", "stock-trend", days] as const,
    lowStock: (limit: number) => ["dashboard", "low-stock", limit] as const,
    topValue: (limit: number) => ["dashboard", "top-value", limit] as const,
  },
};
