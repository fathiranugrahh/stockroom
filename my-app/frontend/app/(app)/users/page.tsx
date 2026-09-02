"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/states";
import { TableSkeleton } from "@/components/table-skeleton";
import { SelectField } from "@/components/select-field";
import {
  getErrorMessage,
  type CreateUserInput,
  type Role,
  type UpdateUserInput,
  type UserRecord,
} from "@/lib/api";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/features/users/queries";
import { userSchema, type UserFormValues } from "@/features/users/schema";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

const PAGE_SIZE = 10;

const emptyForm: UserFormValues = {
  mode: "create",
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  isActive: true,
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        role === "ADMIN"
          ? "border-violet-500/25 bg-violet-500/10 text-violet-400"
          : "border-sky-500/25 bg-sky-500/10 text-sky-400",
      )}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        active
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/25 bg-amber-500/10 text-amber-400",
      )}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

export default function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth();

  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyForm,
  });

  const usersQuery = useUsers(page, PAGE_SIZE, isAdmin);
  const items = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = usersQuery.data?.totalPages ?? 1;
  const loading = usersQuery.isLoading;
  const error = usersQuery.isError ? getErrorMessage(usersQuery.error) : null;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const saving = createUser.isPending || updateUser.isPending;
  const deleting = deleteUser.isPending;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Lock}
        title="Admins only"
        description="You don't have permission to view user management."
      />
    );
  }

  function openCreate() {
    setEditing(null);
    reset(emptyForm);
    setOpen(true);
  }

  function openEdit(u: UserRecord) {
    setEditing(u);
    reset({
      mode: "edit",
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      isActive: u.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: UserFormValues) {
    try {
      if (editing) {
        const payload: UpdateUserInput = {
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          isActive: values.isActive,
        };
        await updateUser.mutateAsync({ id: editing.id, data: payload });
        toast.success("User updated");
      } else {
        const payload: CreateUserInput = {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password ?? "",
          role: values.role,
        };
        await createUser.mutateAsync(payload);
        toast.success("User created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users"
        description="Manage administrator and staff accounts."
      >
        <Button onClick={openCreate}>
          <Plus /> New User
        </Button>
      </PageHeader>

      {loading ? (
        <TableSkeleton cols={6} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Create the first user account."
          action={
            <Button onClick={openCreate}>
              <Plus /> New User
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={u.isActive} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSelf}
                          title={
                            isSelf ? "You cannot delete your own account" : undefined
                          }
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
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

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update account details, role, and status."
                  : "Create an administrator or staff account."}
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
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <SelectField
                      id="role"
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as Role)}
                      placeholder="Select role"
                      options={[
                        { value: "ADMIN", label: "Admin" },
                        { value: "STAFF", label: "Staff" },
                      ]}
                    />
                  )}
                />
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <SelectField
                        id="status"
                        value={field.value ? "active" : "disabled"}
                        onValueChange={(v) => field.onChange(v === "active")}
                        placeholder="Status"
                        options={[
                          { value: "active", label: "Active" },
                          { value: "disabled", label: "Disabled" },
                        ]}
                      />
                    )}
                  />
                </div>
              )}
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
        title="Delete user?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" (${deleteTarget.email}) will be removed and can no longer sign in.`
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
