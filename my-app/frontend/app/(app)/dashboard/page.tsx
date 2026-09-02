"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  LayoutDashboard,
  Package,
  RotateCw,
  Tags,
  Truck,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { StockTrendChart } from "@/components/stock-trend-chart";
import { EmptyState } from "@/components/states";
import { LowStockBadge, MovementBadge } from "@/components/inventory-badges";
import {
  useDashboardSummary,
  useLowStockProducts,
  useStockTrend,
  useTopStockValue,
} from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/format";

const TREND_PERIODS = [7, 14, 30] as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Overview of your inventory at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-56" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [trendDays, setTrendDays] = useState<number>(14);

  const summaryQuery = useDashboardSummary();
  const trendQuery = useStockTrend(trendDays);
  const lowStockQuery = useLowStockProducts(6);
  const topValueQuery = useTopStockValue(5);

  if (summaryQuery.isLoading) return <DashboardSkeleton />;

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description="Overview of your inventory at a glance."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <p className="font-medium">Couldn&apos;t load the dashboard</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              There was a problem fetching your inventory overview.
            </p>
            <Button
              variant="outline"
              onClick={() => summaryQuery.refetch()}
            >
              <RotateCw /> Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const lowStock = lowStockQuery.data ?? [];
  const topValue = topValueQuery.data ?? [];

  const secondaryStats = [
    { label: "Products", value: summary.totalProducts, icon: Package, tone: "text-sky-400 bg-sky-500/10 ring-sky-500/20" },
    { label: "Categories", value: summary.totalCategories, icon: Tags, tone: "text-violet-400 bg-violet-500/10 ring-violet-500/20" },
    { label: "Suppliers", value: summary.totalSuppliers, icon: Truck, tone: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Overview of your inventory at a glance."
      />

      {/* Primary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-0 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Total Stock Value
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Wallet className="size-5" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-emerald-400">
              {formatCurrency(summary.totalStockValue)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {summary.totalProducts} product
              {summary.totalProducts === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "gap-0",
            summary.lowStockCount > 0
              ? "border-amber-500/40"
              : "border-emerald-500/20",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Low Stock
            </CardTitle>
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg ring-1",
                summary.lowStockCount > 0
                  ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
              )}
            >
              <AlertTriangle className="size-5" />
            </span>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {summary.lowStockCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.lowStockCount > 0
                  ? "Products need restocking"
                  : "Everything is above minimum"}
              </p>
            </div>
            {summary.lowStockCount > 0 && (
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Review
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="gap-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </CardTitle>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg ring-1",
                  tone,
                )}
              >
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock trend */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Stock In / Out</CardTitle>
            <p className="text-sm text-muted-foreground">Last {trendDays} days</p>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border p-0.5">
            {TREND_PERIODS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setTrendDays(d)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  trendDays === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {trendQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : trendQuery.data ? (
            <StockTrendChart data={trendQuery.data} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trend data available.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low stock action list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ) : lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Everything is above its minimum. 🎉
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Stock / Min</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {p.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.supplier?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-2">
                            <span className="tabular-nums">
                              <span className="font-medium text-amber-400">
                                {p.stock}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                / {p.minStock}
                              </span>
                            </span>
                            <LowStockBadge />
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href="/stock-movements"
                            className={cn(
                              buttonVariants({ variant: "outline", size: "xs" }),
                            )}
                          >
                            Restock
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top by value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-emerald-400" />
              Top Products by Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topValueQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ) : topValue.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No products yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topValue.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {p.stock}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums text-emerald-400">
                          {formatCurrency(p.stockValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentMovements.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No movements yet"
              description="Stock in and out activity will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="whitespace-nowrap">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentMovements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {m.product?.name ?? m.productId}
                      </TableCell>
                      <TableCell>
                        <MovementBadge type={m.type} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          m.type === "IN"
                            ? "text-emerald-400"
                            : "text-rose-400",
                        )}
                      >
                        {m.type === "IN" ? "+" : "−"}
                        {m.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.note ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(m.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
