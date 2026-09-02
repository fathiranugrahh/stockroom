"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/states";
import { TableSkeleton } from "@/components/table-skeleton";
import { MovementBadge } from "@/components/inventory-badges";
import { PageHeader } from "@/components/page-header";
import { SelectField } from "@/components/select-field";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage, type StockMovementType } from "@/lib/api";
import { useProducts } from "@/features/products/queries";
import {
  useStockIn,
  useStockMovements,
  useStockOut,
} from "@/features/stock-movements/queries";
import {
  stockMovementSchema,
  type StockMovementFormValues,
} from "@/features/stock-movements/schema";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 10;

export default function StockMovementsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<StockMovementType>("IN");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { productId: "", quantity: "", note: "" },
  });

  const movementsQuery = useStockMovements({
    productId: filter || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const movements = movementsQuery.data?.data ?? [];
  const total = movementsQuery.data?.total ?? 0;
  const totalPages = movementsQuery.data?.totalPages ?? 1;
  const loading = movementsQuery.isLoading;
  const error = movementsQuery.isError
    ? getErrorMessage(movementsQuery.error)
    : null;

  const productsQuery = useProducts({ limit: 100 });
  const products = productsQuery.data?.data ?? [];

  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const saving = stockIn.isPending || stockOut.isPending;

  function openForm(m: StockMovementType) {
    setMode(m);
    reset({ productId: "", quantity: "", note: "" });
    setOpen(true);
  }

  async function onSubmit(values: StockMovementFormValues) {
    try {
      const payload = {
        productId: values.productId,
        quantity: Number(values.quantity),
        note: values.note?.trim() || undefined,
      };
      const res =
        mode === "IN"
          ? await stockIn.mutateAsync(payload)
          : await stockOut.mutateAsync(payload);
      toast.success(
        `Stock ${mode} recorded. ${res.product.name} now at ${res.product.stock}.`,
      );
      setOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  function handleFilterChange(value: string) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ArrowLeftRight}
        title="Stock Movements"
        description="Record stock in and out, and review history."
      >
        <Button
          className="bg-emerald-600 text-white hover:bg-emerald-600/90"
          onClick={() => openForm("IN")}
          disabled={products.length === 0}
        >
          <ArrowDownToLine /> Stock In
        </Button>
        <Button
          variant="outline"
          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          onClick={() => openForm("OUT")}
          disabled={products.length === 0}
        >
          <ArrowUpFromLine /> Stock Out
        </Button>
      </PageHeader>

      {products.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">
          Add a product first to record stock movements.
        </p>
      )}

      <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
        <Label htmlFor="filter" className="text-sm">
          Filter by product
        </Label>
        <div className="w-full sm:w-64">
          <SelectField
            id="filter"
            value={filter}
            onValueChange={handleFilterChange}
            placeholder="All products"
            options={[
              { value: "", label: "All products" },
              ...products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.sku})`,
              })),
            ]}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={5} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : movements.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No movements found"
          description={
            filter
              ? "This product has no stock movements yet."
              : "Record a stock in or stock out to see history here."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
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
                      m.type === "IN" ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {m.type === "IN" ? "+" : "−"}
                    {m.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.note ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(m.createdAt)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {mode === "IN" ? "Stock In" : "Stock Out"}
              </DialogTitle>
              <DialogDescription>
                {mode === "IN"
                  ? "Increase the stock of a product."
                  : "Decrease the stock of a product. Cannot exceed current stock."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <SelectField
                    id="product"
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select product…"
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.sku}) — stock ${p.stock}`,
                    }))}
                  />
                )}
              />
              {errors.productId && (
                <p className="text-xs text-destructive">
                  {errors.productId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                aria-invalid={!!errors.quantity}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">
                  {errors.quantity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" {...register("note")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : `Record ${mode}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
