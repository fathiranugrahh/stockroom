"use client";

import type { Role } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

/** Renders children only when the current user has the given role. */
export function RequireRole({
  role,
  children,
  fallback = null,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || user.role !== role) return <>{fallback}</>;
  return <>{children}</>;
}
