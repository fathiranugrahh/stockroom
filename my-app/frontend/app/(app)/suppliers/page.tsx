"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/states";
import { TableSkeleton } from "@/components/table-skeleton";
import { PageHeader } from "@/components/page-header";
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
  getErrorMessage,
  type Supplier,
  type SupplierInput,
} from "@/lib/api";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/features/suppliers/queries";
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/features/suppliers/schema";
import { useAuth } from "@/providers/auth-provider";

const emptyForm: SupplierFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function SuppliersPage() {
  const { isAdmin } = useAuth();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: emptyForm,
  });

  const suppliersQuery = useSuppliers();
  const items = suppliersQuery.data ?? [];
  const loading = suppliersQuery.isLoading;
  const error = suppliersQuery.isError
    ? getErrorMessage(suppliersQuery.error)
    : null;

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const saving = createSupplier.isPending || updateSupplier.isPending;
  const deleting = deleteSupplier.isPending;

  function openCreate() {
    setEditing(null);
    reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Supplier) {
    setEditing(item);
    reset({
      name: item.name,
      email: item.email ?? "",
      phone: item.phone ?? "",
      address: item.address ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: SupplierFormValues) {
    try {
      const payload: SupplierInput = {
        name: values.name.trim(),
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        address: values.address?.trim() || undefined,
      };
      if (editing) {
        await updateSupplier.mutateAsync({ id: editing.id, data: payload });
        toast.success("Supplier updated");
      } else {
        await createSupplier.mutateAsync(payload);
        toast.success("Supplier created");
      }
      setOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSupplier.mutateAsync(deleteTarget.id);
      toast.success("Supplier deleted");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Truck}
        title="Suppliers"
        description="Manage the suppliers you buy from."
      >
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus /> New Supplier
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <TableSkeleton cols={5} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers yet"
          description="Add a supplier to link products to where you buy them."
          action={
            isAdmin ? (
              <Button onClick={openCreate}>
                <Plus /> New Supplier
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                {isAdmin && (
                  <TableHead className="w-24 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.address || "—"}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Supplier" : "New Supplier"}
              </DialogTitle>
              <DialogDescription>
                Only the name is required.
              </DialogDescription>
            </DialogHeader>

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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
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
        title="Delete supplier?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
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
