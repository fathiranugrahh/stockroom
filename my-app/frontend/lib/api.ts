// Typed API client for the Inventory backend.
// Shapes follow backend/docs/api-contract.md.

import { tokenStore } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Role = "ADMIN" | "STAFF";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ---- Types ----

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  categoryId: string;
  supplierId?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  supplier?: Supplier | null;
}

export type StockMovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string | null;
  createdAt: string;
  product?: Pick<Product, "id" | "name" | "sku"> | null;
}

export interface StockMovementResult {
  movement: StockMovement;
  product: Product;
}

export interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockCount: number;
  totalStockValue: number;
  recentMovements: StockMovement[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface StockTrendPoint {
  date: string;
  in: number;
  out: number;
}

export interface TopStockValueItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  stockValue: number;
}

// ---- Payloads ----

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface SupplierInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  price: number;
  stock?: number;
  minStock?: number;
  categoryId: string;
  supplierId?: string | null;
}

export interface StockMovementInput {
  productId: string;
  quantity: number;
  note?: string;
}

// ---- Error handling ----

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Turn any thrown error into a short, user-friendly message.
 * Backend 400/404/409 responses already carry descriptive messages, so we
 * surface those; network and 5xx errors get a generic friendly fallback.
 */
export function getErrorMessage(
  e: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (e instanceof ApiError) {
    if (e.status === 0) return e.message; // network / unreachable
    if (e.status >= 500) {
      return "The server ran into a problem. Please try again shortly.";
    }
    if (e.message) return e.message; // 400/404/409 friendly backend message
    switch (e.status) {
      case 400:
        return "Some of the information provided is invalid.";
      case 404:
        return "The requested item could not be found.";
      case 409:
        return "This action conflicts with existing data.";
      default:
        return fallback;
    }
  }
  return fallback;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      "Cannot reach the API. Is the backend running?",
      0,
    );
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (Array.isArray(body?.message)) message = body.message.join(", ");
      else if (typeof body?.message === "string") message = body.message;
    } catch {
      // ignore parse errors, keep statusText
    }

    // Central 401 handling: clear the session and bounce to /login.
    // The login request itself is exempt so bad credentials surface inline.
    const isLoginRequest = path.startsWith("/auth/login");
    if (res.status === 401 && !isLoginRequest) {
      tokenStore.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login?expired=1";
      }
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- Categories ----

export const categoriesApi = {
  list: () => request<Category[]>("/categories"),
  get: (id: string) => request<Category>(`/categories/${id}`),
  create: (data: CategoryInput) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CategoryInput>) =>
    request<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/categories/${id}`, {
      method: "DELETE",
    }),
};

// ---- Suppliers ----

export const suppliersApi = {
  list: () => request<Supplier[]>("/suppliers"),
  get: (id: string) => request<Supplier>(`/suppliers/${id}`),
  create: (data: SupplierInput) =>
    request<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<SupplierInput>) =>
    request<Supplier>(`/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/suppliers/${id}`, {
      method: "DELETE",
    }),
};

// ---- Products ----

export const productsApi = {
  list: (query: ProductQuery = {}) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.supplierId) params.set("supplierId", query.supplierId);
    if (query.lowStock) params.set("lowStock", "true");
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return request<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => request<Product>(`/products/${id}`),
  create: (data: ProductInput) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ProductInput>) =>
    request<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/products/${id}`, {
      method: "DELETE",
    }),
};

// ---- Stock movements ----

export const stockMovementsApi = {
  list: (opts: { productId?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (opts.productId) params.set("productId", opts.productId);
    if (opts.page) params.set("page", String(opts.page));
    if (opts.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    return request<Paginated<StockMovement>>(
      `/stock-movements${qs ? `?${qs}` : ""}`,
    );
  },
  stockIn: (data: StockMovementInput) =>
    request<StockMovementResult>("/stock-movements/in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  stockOut: (data: StockMovementInput) =>
    request<StockMovementResult>("/stock-movements/out", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---- Dashboard ----

export const dashboardApi = {
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  lowStockProducts: (limit?: number) =>
    request<Product[]>(
      `/dashboard/low-stock-products${limit ? `?limit=${limit}` : ""}`,
    ),
  stockTrend: (days?: number) =>
    request<StockTrendPoint[]>(
      `/dashboard/stock-trend${days ? `?days=${days}` : ""}`,
    ),
  topStockValue: (limit?: number) =>
    request<TopStockValueItem[]>(
      `/dashboard/top-stock-value${limit ? `?limit=${limit}` : ""}`,
    ),
};


// ---- Auth ----

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AuthUser>("/auth/me"),
};


// ---- Users (ADMIN) ----

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
}>;

export const usersApi = {
  list: (page = 1, limit = 10) =>
    request<Paginated<UserRecord>>(`/users?page=${page}&limit=${limit}`),
  create: (data: CreateUserInput) =>
    request<UserRecord>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserInput) =>
    request<UserRecord>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/users/${id}`, {
      method: "DELETE",
    }),
};

// ---- Audit logs (ADMIN) ----

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: Role } | null;
}

export interface AuditQuery {
  entity?: string;
  action?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  list: (query: AuditQuery = {}) => {
    const params = new URLSearchParams();
    if (query.entity) params.set("entity", query.entity);
    if (query.action) params.set("action", query.action);
    if (query.userId) params.set("userId", query.userId);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return request<Paginated<AuditLogRecord>>(
      `/audit-logs${qs ? `?${qs}` : ""}`,
    );
  },
};
