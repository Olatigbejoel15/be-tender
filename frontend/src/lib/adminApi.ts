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