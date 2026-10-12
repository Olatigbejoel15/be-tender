import type { Product } from "@/data/products";

// Where the Laravel API lives (set in .env.local)
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

// The filters the API understands (same as ProductIndexRequest in Laravel)
type Filters = {
  category?: string; // category slug: "women", "men", "accessories"
  featured?: boolean;
  search?: string;
  sort?: "price_asc" | "price_desc";
};

// One small helper for every GET request
async function request<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" }, // ask Laravel for JSON errors
    next: { revalidate: 60 }, // reuse the response for 60s, so catalogue edits show within a minute
  });
  if (res.status === 404) return null; // unknown product: the caller shows a 404 page
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

// List products, optionally filtered
export async function getProducts(filters: Filters = {}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (filters.category) qs.set("category", filters.category);
  if (filters.featured) qs.set("featured", "1");
  if (filters.search) qs.set("search", filters.search);
  if (filters.sort) qs.set("sort", filters.sort);
  const q = qs.toString();
  const body = await request<{ data: Product[] }>(`/products${q ? `?${q}` : ""}`); // Laravel wraps lists in "data"
  return body?.data ?? [];
}

// One product by its slug, or null if it doesn't exist
export async function getProduct(slug: string): Promise<Product | null> {
  const body = await request<{ data: Product }>(`/products/${encodeURIComponent(slug)}`);
  return body?.data ?? null;
}