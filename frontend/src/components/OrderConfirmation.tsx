"use client"; // needs the login token, so it fetches in the browser

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/authApi";
import { getOrder, type Order } from "@/lib/ordersApi";
import { naira } from "@/lib/format";

export default function OrderConfirmation({ reference }: { reference: string }) {
  const { user, ready } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  // Load the order once we know who is signed in
  useEffect(() => {
    if (!ready || !user) return;
    getOrder(reference)
      .then(setOrder)
      .catch((e) => setError(e instanceof ApiError && e.status === 404 ? "We couldn't find that order." : "Could not load the order."));
  }, [ready, user, reference]);

  if (!ready) return <p className="text-muted">Loading...</p>;
  if (!user) return <p>Please <Link href="/login" className="underline">sign in</Link> to view this order.</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p className="text-muted">Loading your order...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start gap-4 rounded-3xl bg-accent/10 p-6">
        <CheckCircle2 className="mt-0.5 shrink-0 text-accent" />
        <div>
          <p className="text-lg font-semibold">Order received</p>
          <p className="text-sm text-muted">
            Reference <strong className="text-ink">{order.reference}</strong> · {order.statusLabel}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-black/10 rounded-3xl border border-black/10 px-6">
        {order.items.map((i, n) => (
          <li key={n} className="flex gap-4 py-5">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
              <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">{i.name}</p>
              <p className="text-xs text-muted">{i.color} · {i.size} · Qty {i.quantity}</p>
            </div>
            <p className="text-sm font-semibold">{naira.format(i.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 sm:grid-cols-2">
        <section className="text-sm">
          <h2 className="font-semibold">Delivering to</h2>
          <p className="mt-2 text-muted">
            {order.recipientName}<br />{order.address}<br />{order.city}, {order.state}<br />{order.phone}
          </p>
        </section>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{naira.format(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : naira.format(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold"><dt>Total</dt><dd>{naira.format(order.total)}</dd></div>
        </dl>
      </div>

      <Link href="/shop" className="inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase">
        Continue shopping
      </Link>
    </div>
  );
}