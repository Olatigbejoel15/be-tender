"use client"; // fetches with the login token, so it runs in the browser

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { listOrders, type Order } from "@/lib/ordersApi";
import { naira } from "@/lib/format";

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null); // null = still loading
  const [error, setError] = useState("");

  // Load this customer's orders once
  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(() => setError("Could not load your orders."));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!orders) return <p className="text-sm text-muted">Loading your orders...</p>;

  // No orders yet: the friendly empty state
  if (orders.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center rounded-3xl border border-black/10 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Package size={24} />
        </span>
        <p className="mt-4 text-lg font-semibold">No orders yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted">Your orders will show up here once you place one.</p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase"
        >
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
      <h2 className="text-xl font-semibold">Your orders</h2>
      <ul className="mt-4 divide-y divide-black/10">
        {orders.map((o) => (
          <li key={o.reference}>
            {/* Each row links to the full order page */}
            <Link href={`/order/${o.reference}`} className="flex items-center justify-between gap-4 py-4 transition hover:text-accent">
              <div className="min-w-0">
                <p className="font-semibold">{o.reference}</p>
                <p className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{naira.format(o.total)}</p>
                <p className="text-xs text-muted">{o.statusLabel}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}