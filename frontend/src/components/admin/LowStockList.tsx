"use client"; // loads data in the browser

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/authApi";
import { getLowStock, type LowStockRow } from "@/lib/adminApi";

export default function LowStockList() {
  const [rows, setRows] = useState<LowStockRow[] | null>(null); // null = still loading
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    let cancelled = false;
    getLowStock()
      .then((r) => { if (!cancelled) { setRows(r); setError(""); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load the stock list."); });
    return () => { cancelled = true; };
  }, [attempt]);

  // Group the rows by product, lowest stock first
  const groups = new Map<number, { product: LowStockRow["product"]; rows: LowStockRow[] }>();
  (rows ?? []).forEach((r) => {
    const g = groups.get(r.product.id) ?? { product: r.product, rows: [] };
    g.rows.push(r);
    groups.set(r.product.id, g);
  });
  const list = [...groups.values()]
    .map((g) => ({ ...g, rows: [...g.rows].sort((a, b) => a.quantity - b.quantity) }))
    .sort((a, b) => a.rows[0].quantity - b.rows[0].quantity || a.product.name.localeCompare(b.product.name));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Low stock</h1>
      <p className="mt-1 text-sm text-muted">Colour and size combinations that are almost gone, or sold out.</p>

      {error && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}

      {!rows && !error && <p className="mt-8 text-muted">Loading...</p>}

      {rows && list.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white px-6 py-14 text-center">
          <p className="font-semibold">Nothing is running low.</p>
          <p className="mt-1 text-sm text-muted">Every colour and size is well stocked.</p>
        </div>
      )}

      {list.length > 0 && (
        <>
          <p className="mt-6 text-sm text-muted">{rows?.length} combination{rows?.length === 1 ? "" : "s"} across {list.length} product{list.length === 1 ? "" : "s"}.</p>
          <ul className="mt-3 space-y-4">
            {list.map((g) => (
              <li key={g.product.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{g.product.name}</p>
                  <Link href={`/admin/products/${g.product.id}`} className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold transition hover:border-ink">
                    Restock
                  </Link>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.rows.map((r) => (
                    <li key={`${r.color}-${r.size}`}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${r.quantity === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {r.color} / {r.size}: {r.quantity === 0 ? "sold out" : `${r.quantity} left`}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}