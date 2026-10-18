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