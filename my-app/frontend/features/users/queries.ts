"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  usersApi,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useUsers(page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.list({ page, limit }),
    queryFn: () => usersApi.list(page, limit),
    enabled,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}
