"use client"; // uses state and loads data in the browser

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { listOrders, type AdminOrder, type Page } from "@/lib/adminApi";
import { formatDateTime, naira } from "@/lib/format";
import StatusBadge, { GuestBadge, RefundBadge } from "@/components/admin/StatusBadge";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersList() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState(""); // what is typed
  const [search, setSearch] = useState("");           // what is sent (after a short pause)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<AdminOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry

  // Wait 400ms after typing stops, then search from page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load whenever a filter or the page changes
  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after we've moved on
    setLoading(true);
    setError("");

    listOrders({ status, search, from, to, page })
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load orders."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [status, search, from, to, page, attempt]);

  const pickStatus = (v: string) => { setStatus(v); setPage(1); };
  const orders = result?.data ?? [];
  const meta = result?.meta;

  const field = "rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>

      {/* Status chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button key={t.value} onClick={() => pickStatus(t.value)} aria-pressed={status === t.value}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              status === t.value ? "border-accent bg-accent text-white" : "border-ink/15 bg-white hover:border-ink"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search and dates */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search reference, name or email" className={`${field} w-full pl-9`} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">From
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">To
          <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={field} />
        </label>
        {(from || to) && (
          <button onClick={() => { setFrom(""); setTo(""); setPage(1); }} className="text-sm underline underline-offset-4 hover:text-accent">
            Clear dates
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}

      {!result && !error && <p className="mt-8 text-muted">Loading...</p>}

      {result && (
        <div className={`mt-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white px-6 py-14 text-center">
              <p className="font-semibold">No orders match these filters.</p>
              <p className="mt-1 text-sm text-muted">Try a different status or clear the search.</p>
            </div>
          ) : (
            <>
              {/* Wide screens: table */}
              <div className="hidden overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm md:block">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted uppercase">
                    <tr>
                      <th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3 text-right">Items</th><th className="px-5 py-3 text-right">Total</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.reference} onClick={() => router.push(`/admin/orders/${o.reference}`)}
                        className="cursor-pointer border-t border-black/5 transition hover:bg-black/5">
                        <td className="px-5 py-4">
                          <Link href={`/admin/orders/${o.reference}`} onClick={(e) => e.stopPropagation()} className="font-semibold hover:text-accent">
                            {o.reference}
                          </Link>
                          <p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {o.recipientName}
                            {o.customer.isGuest && <GuestBadge />}
                            {o.needsRefund && <RefundBadge />}
                          </p>
                          <p className="text-xs text-muted">{o.customer.email}</p>
                        </td>
                        <td className="px-5 py-4 text-right">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                        <td className="px-5 py-4 text-right font-medium">{naira.format(o.total)}</td>
                        <td className="px-5 py-4"><StatusBadge status={o.status} label={o.statusLabel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones: cards */}
              <ul className="space-y-3 md:hidden">
                {orders.map((o) => (
                  <li key={o.reference}>
                    <Link href={`/admin/orders/${o.reference}`} className="block rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold">{o.reference}</span>
                        <StatusBadge status={o.status} label={o.statusLabel} />
                      </div>
                      <p className="mt-2 text-sm">
                        {o.recipientName}
                        {o.customer.isGuest && <GuestBadge />}
                        {o.needsRefund && <RefundBadge />}
                      </p>
                      <div className="mt-1 flex justify-between text-xs text-muted">
                        <span>{formatDateTime(o.createdAt)}</span>
                        <span className="font-semibold text-ink">{naira.format(o.total)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {meta && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <p>Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total}</p>
                  <div className="flex items-center gap-2">
                    <button disabled={meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}
                      className="rounded-full border border-ink/15 px-4 py-1.5 font-medium text-ink disabled:opacity-40">Previous</button>
                    <span>Page {meta.current_page} of {meta.last_page}</span>
                    <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                      className="rounded-full border border-ink/15 px-4 py-1.5 font-medium text-ink disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}