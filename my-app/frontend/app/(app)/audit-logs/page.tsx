"use client";

import { useState } from "react";
import { Lock, ScrollText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/states";
import { TableSkeleton } from "@/components/table-skeleton";
import { SelectField } from "@/components/select-field";
import { getErrorMessage } from "@/lib/api";
import { useAuditLogs } from "@/features/audit-logs/queries";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

const PAGE_SIZE = 15;

const ENTITY_OPTIONS = [
  { value: "", label: "All entities" },
  { value: "Auth", label: "Auth" },
  { value: "User", label: "User" },
  { value: "Product", label: "Product" },
  { value: "Category", label: "Category" },
  { value: "Supplier", label: "Supplier" },
  { value: "StockMovement", label: "Stock Movement" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "USER_LOGIN", label: "Login" },
  { value: "USER_CREATED", label: "User created" },
  { value: "USER_UPDATED", label: "User updated" },
  { value: "USER_DELETED", label: "User deleted" },
  { value: "PRODUCT_CREATED", label: "Product created" },
  { value: "PRODUCT_UPDATED", label: "Product updated" },
  { value: "PRODUCT_DELETED", label: "Product deleted" },
  { value: "CATEGORY_CREATED", label: "Category created" },
  { value: "CATEGORY_UPDATED", label: "Category updated" },
  { value: "CATEGORY_DELETED", label: "Category deleted" },
  { value: "SUPPLIER_CREATED", label: "Supplier created" },
  { value: "SUPPLIER_UPDATED", label: "Supplier updated" },
  { value: "SUPPLIER_DELETED", label: "Supplier deleted" },
  { value: "STOCK_IN", label: "Stock in" },
  { value: "STOCK_OUT", label: "Stock out" },
];

function actionTone(action: string): string {
  if (action.includes("LOGIN"))
    return "border-sky-500/25 bg-sky-500/10 text-sky-400";
  if (action === "STOCK_IN" || action.includes("CREATED"))
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
  if (action.includes("UPDATED"))
    return "border-amber-500/25 bg-amber-500/10 text-amber-400";
  if (action === "STOCK_OUT" || action.includes("DELETED"))
    return "border-rose-500/25 bg-rose-500/10 text-rose-400";
  return "border-border bg-muted text-muted-foreground";
}

function actionLabel(action: string): string {
  return action.replace(/_/g, " ").toLowerCase();
}

function summarizeMetadata(
  metadata?: Record<string, unknown> | null,
): string {
  if (!metadata || typeof metadata !== "object") return "—";
  const parts = Object.entries(metadata).map(([k, v]) => {
    const value = Array.isArray(v) ? v.join(", ") : String(v);
    return `${k}: ${value}`;
  });
  const text = parts.join(" · ");
  return text.length > 90 ? `${text.slice(0, 90)}…` : text || "—";
}

export default function AuditLogsPage() {
  const { isAdmin } = useAuth();

  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");

  const auditQuery = useAuditLogs(
    {
      entity: entity || undefined,
      action: action || undefined,
      page,
      limit: PAGE_SIZE,
    },
    isAdmin,
  );
  const items = auditQuery.data?.data ?? [];
  const total = auditQuery.data?.total ?? 0;
  const totalPages = auditQuery.data?.totalPages ?? 1;
  const loading = auditQuery.isLoading;
  const error = auditQuery.isError ? getErrorMessage(auditQuery.error) : null;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Lock}
        title="Admins only"
        description="You don't have permission to view audit logs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Audit Logs"
        description="Track important actions across the system."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <div className="w-48">
          <SelectField
            value={entity}
            onValueChange={(v) => {
              setEntity(v);
              setPage(1);
            }}
            placeholder="All entities"
            options={ENTITY_OPTIONS}
          />
        </div>
        <div className="w-56">
          <SelectField
            value={action}
            onValueChange={(v) => {
              setAction(v);
              setPage(1);
            }}
            placeholder="All actions"
            options={ACTION_OPTIONS}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={6} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No activity found"
          description="No audit entries match the current filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap">When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <span className="font-medium">{log.user.name}</span>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium whitespace-nowrap capitalize",
                        actionTone(log.action),
                      )}
                    >
                      {actionLabel(log.action)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.entity}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityId ? `${log.entityId.slice(0, 8)}…` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {summarizeMetadata(log.metadata)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
