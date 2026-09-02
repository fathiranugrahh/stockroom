"use client";

import { useQuery } from "@tanstack/react-query";

import { auditApi, type AuditQuery } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useAuditLogs(query: AuditQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(query),
    queryFn: () => auditApi.list(query),
    enabled,
  });
}
