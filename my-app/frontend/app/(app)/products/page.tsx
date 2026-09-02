"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/states";
import { TableSkeleton } from "@/components/table-skeleton";
import { LowStockBadge } from "@/components/inventory-badges";
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
import {
  categoriesApi,
  getErrorMessage,
  suppliersApi,
  type Product,
  type ProductInput,
  type ProductQuery,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/features/products/queries";
import {
  productSchema,
  type ProductFormValues,
} from "@/features/products/schema";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

const emptyForm: ProductFormValues = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  minStock: "",
  categoryId: "",
  supplierId: "",
};

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { isAdmin } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyForm,
  });

  const hasFilters = Boolean(search || categoryId || supplierId || lowStock);

  // Debounce the search term (preserves the original 250ms behavior).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const query: ProductQuery = {
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    supplierId: supplierId || undefined,
    lowStock: lowStock || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const productsQuery = useProducts(query);
  const items = productsQuery.data?.data ?? [];
  const total = productsQuery.data?.total ?? 0;
  const totalPages = productsQuery.data?.totalPages ?? 1;
  const loading = productsQuery.isLoading;
  const error = productsQuery.isError
    ? getErrorMessage(productsQuery.error)
    : null;

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });
  const suppliersQuery = useQuery({
    queryKey: queryKeys.suppliers.list(),
    queryFn: () => suppliersApi.list(),
  });
  const categories = categoriesQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const saving = createProduct.isPending || updateProduct.isPending;
  const deleting = deleteProduct.isPending;

  // Reset to page 1 whenever a filter changes.
  function updateFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId("");
    setSupplierId("");
    setLowStock(false);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Product) {
    setEditing(item);
    reset({
      name: item.name,
      sku: item.sku,
      price: String(item.price),
      stock: String(item.stock),
      minStock: String(item.minStock),
      categoryId: item.categoryId,
      supplierId: item.supplierId ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      const base: ProductInput = {
        name: values.name.trim(),
        sku: values.sku.trim(),
        price: Number(values.price),
        minStock: values.minStock ? Number(values.minStock) : 0,
        categoryId: values.categoryId,
        supplierId: values.supplierId || null,
      };
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: base });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync({
          ...base,
          stock: values.stock ? Number(values.stock) : 0,
        });
        toast.success("Product created");
      }
      setOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Products"
        description="Manage your product catalog and stock levels."
      >
        {isAdmin && (
          <Button onClick={openCreate} disabled={categories.length === 0}>
            <Plus /> New Product
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <div className="relative w-full sm:min-w-56 sm:flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or SKU…"
            value={search}
            onChange={(e) => updateFilter(() => setSearch(e.target.value))}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={categoryId}
            onValueChange={(v) => updateFilter(() => setCategoryId(v))}
            placeholder="All categories"
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={supplierId}
            onValueChange={(v) => updateFilter(() => setSupplierId(v))}
            placeholder="All suppliers"
            options={[
              { value: "", label: "All suppliers" },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
        <label className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => updateFilter(() => setLowStock(e.target.checked))}
          />
          Low stock only
        </label>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X /> Clear
          </Button>
        )}
      </div>

      {categories.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">
          Create a category first before adding products.
        </p>
      )}

      {loading ? (
        <TableSkeleton cols={6} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasFilters ? "No matching products" : "No products yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Add your first product to start tracking stock."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <X /> Clear filters
              </Button>
            ) : categories.length > 0 && isAdmin ? (
              <Button onClick={openCreate}>
                <Plus /> New Product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                {isAdmin && (
                  <TableHead className="w-24 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const low = item.stock <= item.minStock;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.supplier?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            "tabular-nums",
                            low && "font-medium text-amber-400",
                          )}
                        >
                          {item.stock}
                        </span>
                        {low && <LowStockBadge />}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
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
                {editing ? "Edit Product" : "New Product"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Stock is adjusted via Stock Movements."
                  : "Fill in the product details."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  aria-invalid={!!errors.sku}
                  {...register("sku")}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.price}
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    aria-invalid={!!errors.stock}
                    {...register("stock")}
                  />
                  {errors.stock && (
                    <p className="text-xs text-destructive">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.minStock}
                  {...register("minStock")}
                />
                {errors.minStock && (
                  <p className="text-xs text-destructive">
                    {errors.minStock.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <SelectField
                      id="categoryId"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select category…"
                      options={categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  )}
                />
                {errors.categoryId && (
                  <p className="text-xs text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier (optional)</Label>
                <Controller
                  control={control}
                  name="supplierId"
                  render={({ field }) => (
                    <SelectField
                      id="supplierId"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="None"
                      options={[
                        { value: "", label: "None" },
                        ...suppliers.map((s) => ({
                          value: s.id,
                          label: s.name,
                        })),
                      ]}
                    />
                  )}
                />
              </div>
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
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" (${deleteTarget.sku}) will be permanently removed. This cannot be undone.`
            : undefined
        }
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
