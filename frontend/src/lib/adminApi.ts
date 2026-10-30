import { call } from "@/lib/authApi";
import { getToken } from "@/lib/ordersApi";

// What the analytics endpoints return
export type AnalyticsSummary = {
  days: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  previous: { revenue: number; orders: number };
  change: { revenuePercent: number | null; ordersPercent: number | null }; // null = nothing to compare with
  ordersByStatus: Record<string, number>;
  lowStockOptions: number;
};
export type RevenuePoint = { date: string; revenue: number; orders: number };
export type TopProduct = { productId: number; name: string; units: number; revenue: number };

// One helper for every admin call: adds /admin and the saved token
export function adminCall<T>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: unknown) {
  return call<T>(`/admin${path}`, method, getToken(), body);
}

export const getSummary = async (days: number) =>
  (await adminCall<{ data: AnalyticsSummary }>(`/analytics/summary?days=${days}`)).data;

export const getRevenue = async (days: number) =>
  (await adminCall<{ data: RevenuePoint[] }>(`/analytics/revenue?days=${days}`)).data;

export const getTopProducts = async (days: number, limit = 5) =>
  (await adminCall<{ data: TopProduct[] }>(`/analytics/top-products?days=${days}&limit=${limit}`)).data;

// ---------- Orders ----------

export type OrderStatusValue = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export type AdminOrderItem = {
  name: string; color: string; size: string; image: string | null;
  unitPrice: number; quantity: number; lineTotal: number;
};

export type OrderHistoryEntry = {
  from: string | null; to: string; toLabel: string;
  note: string | null; by: string | null; createdAt: string;
};

export type AdminOrder = {
  reference: string;
  status: OrderStatusValue;
  statusLabel: string;
  subtotal: number; deliveryFee: number; total: number;
  recipientName: string; phone: string; address: string; city: string; state: string;
  paidAt: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  paymentReference: string | null;
  customer: { id: number | null; name: string; email: string; phone: string | null; isGuest: boolean };
  nextStatuses: { value: string; label: string }[]; // the only moves allowed right now
  history?: OrderHistoryEntry[];                     // detail only
  needsRefund: boolean; // A customer paid for this order after it was cancelled
};

export type Page<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
};

export type OrderQuery = { status?: string; search?: string; from?: string; to?: string; page?: number; per_page?: number };

export function listOrders(q: OrderQuery) {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v)); // skip empty filters
  });
  const qs = p.toString();
  return adminCall<Page<AdminOrder>>(`/orders${qs ? `?${qs}` : ""}`);
}

export const getOrder = async (reference: string) =>
  (await adminCall<{ data: AdminOrder }>(`/orders/${encodeURIComponent(reference)}`)).data;

export const changeOrderStatus = (reference: string, status: string, note: string) =>
  adminCall<unknown>(`/orders/${encodeURIComponent(reference)}/status`, "PATCH", {
    status,
    ...(note.trim() ? { note: note.trim() } : {}), // the note is optional
  });

  // ---------- Products ----------

export type ProductPhoto = { id: number; color: string | null; position: number; url: string };
export type ProductColor = { name: string; hex: string; image: string | null };
export type StockRow = { color: string; size: string; quantity: number };

export type AdminProduct = {
  id: number; slug: string; name: string;
  category: string; categoryId: number;
  price: number; image: string; badge: string | null;
  description: string; features: string[]; fabric: string; care: string;
  sizeLabel: string | null; sizes: string[]; colors: ProductColor[];
  isSoldOut: boolean; isFeatured: boolean; isPublished: boolean;
  version: number;                 // send this back when editing
  photos?: ProductPhoto[];
  stock?: StockRow[];              // exact counts (staff only)
  updatedAt: string;
};

export type AdminCategory = { id: number; name: string; slug: string };

export type ProductQuery = {
  search?: string; category?: string;
  published?: string;              // "1" live, "0" drafts
  sold_out?: string;               // "1" sold out, "0" in stock
  page?: number; per_page?: number;
};

export function listProducts(q: ProductQuery) {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v)); // skip empty filters
  });
  const qs = p.toString();
  return adminCall<Page<AdminProduct>>(`/products${qs ? `?${qs}` : ""}`);
}

// Public endpoint, used to fill the category filter
export const getCategories = () =>
  call<{ data: AdminCategory[] }>("/categories", "GET", null).then((r) => r.data);

// Publish or hide a product. The version proves we saw the latest copy (409 if someone else edited it).
export const setProductPublished = (id: number, version: number, isPublished: boolean) =>
  adminCall<unknown>(`/products/${id}`, "PATCH", { version, is_published: isPublished });

export const deleteProduct = (id: number) => adminCall<void>(`/products/${id}`, "DELETE");

// What the form sends (snake_case, as the Laravel request expects)
export type ProductInput = {
  category_id: number;
  name: string;
  price: number;
  badge: string | null;
  description: string;
  features: string[];
  fabric: string;
  care: string;
  size_label: string | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  is_featured: boolean;
  is_sold_out: boolean;
  is_published: boolean;
};

export const getProduct = async (id: number | string) =>
  (await adminCall<{ data: AdminProduct }>(`/products/${id}`)).data;

export const createProduct = async (input: ProductInput) =>
  (await adminCall<{ data: AdminProduct }>("/products", "POST", input)).data;

// The version proves we edited the latest copy (409 if someone else saved first)
export const updateProduct = (id: number, version: number, input: ProductInput) =>
  adminCall<unknown>(`/products/${id}`, "PATCH", { ...input, version });

// "Dark Green" -> "dark-green": the same key the server uses to match photos to colours
export const colorSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Multipart upload: the file plus which colour it belongs to
export const uploadProductPhoto = (id: number, file: File, colourSlug: string) => {
  const form = new FormData();
  form.append("photo", file);
  form.append("color", colourSlug);
  return adminCall<unknown>(`/products/${id}/photos`, "POST", form);
};

export const deleteProductPhoto = (id: number, photoId: number) =>
  adminCall<unknown>(`/products/${id}/photos/${photoId}`, "DELETE");

// Set exact quantities for the cells that changed
export const saveStock = (id: number, entries: { color: string; size: string; set: number }[]) =>
  adminCall<unknown>(`/products/${id}/stock`, "PATCH", { stock: entries });

// ---------- Low stock ----------

export type LowStockRow = {
  product: { id: number; name: string; slug: string };
  color: string;
  size: string;
  quantity: number;
};

export const getLowStock = async () => (await adminCall<{ data: LowStockRow[] }>("/stock/low")).data;

// ---------- Audit log (super admin) ----------

export type AuditEntry = {
  id: number;
  action: string;                                            // e.g. "product.updated"
  summary: string;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  by: string;                                                // "System" for automatic actions
  subjectType: string;                                       // "product" | "user"
  subjectId: number;
  ip: string | null;
  createdAt: string;
};

export type AuditQuery = { action?: string; subject_type?: string; page?: number };

export function listAuditLogs(q: AuditQuery) {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v)); // skip empty filters
  });
  const qs = p.toString();
  return adminCall<Page<AuditEntry>>(`/audit-logs${qs ? `?${qs}` : ""}`);
}

// ---------- Staff (super admin) ----------

export type StaffRole = "customer" | "admin" | "super_admin"; // "customer" = remove from staff

export type StaffMember = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  createdAt: string;
};

export const listStaff = async () => (await adminCall<{ data: StaffMember[] }>("/staff")).data;

// Existing customer: just email + role. Brand-new person: also name + password.
export const addStaff = (input: { email: string; role: "admin" | "super_admin"; name?: string; password?: string }) =>
  adminCall<{ data: StaffMember }>("/staff", "POST", input);

export const updateStaff = (id: number, change: { role?: StaffRole; is_active?: boolean }) =>
  adminCall<{ data: StaffMember }>(`/staff/${id}`, "PATCH", change);