"use client"; // needs the login token, session storage and the browser address

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/authApi";
import { confirmPayment, getGuestEmail, getOrder, rememberGuestEmail, startPayment, type Order } from "@/lib/ordersApi";
import { naira } from "@/lib/format";

export default function OrderConfirmation({ reference }: { reference: string }) {
  const { user, ready } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [returned, setReturned] = useState(false); // true if we just came back from Paystack
  const [busy, setBusy] = useState(false);         // true while a payment call is running
  const [payError, setPayError] = useState("");
  const [guestEmail, setGuestEmail] = useState<string | null>(() => getGuestEmail(reference)); // guests only
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  // Load the order. If Paystack just sent the customer back, confirm the payment first.
  const load = useCallback(async (email: string | null) => {
    const params = new URLSearchParams(window.location.search);
    const cameBack = params.has("reference") || params.has("trxref"); // Paystack adds these

    try {
      const o = cameBack ? await confirmPayment(reference, email) : await getOrder(reference, email);
      setOrder(o);
      setError("");
      if (cameBack) {
        setReturned(true);
        window.history.replaceState(null, "", window.location.pathname); // tidy the address bar
      }
    } catch (e) {
      if (email && e instanceof ApiError && (e.status === 404 || e.status === 422)) {
        setEmailError("That email doesn't match this order. Please try again.");
        setGuestEmail(null); // shows the email form again
        setOrder(null);
      } else if (e instanceof ApiError && e.status === 404) {
        setError("We couldn't find that order.");
      } else {
        setError("Could not load the order.");
      }
    }
  }, [reference]);

  useEffect(() => {
    if (!ready) return;
    if (user) load(null);                    // signed in: account route
    else if (guestEmail) load(guestEmail);   // guest with a known email
  }, [ready, user, guestEmail, load]);

  // Guest typed their email
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim().toLowerCase();
    setEmailError("");
    rememberGuestEmail(reference, clean);
    setGuestEmail(clean); // the effect above loads the order
  };

  // Send the customer to Paystack to pay
  const pay = async () => {
    setPayError("");
    setBusy(true);
    try {
      window.location.href = await startPayment(reference, user ? null : guestEmail); // leaves our site for Paystack's page
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : "Could not start the payment. Please try again.");
      setBusy(false);
    }
  };

  // "I've paid but it still says pending": ask Paystack again
  const checkAgain = async () => {
    setPayError("");
    setBusy(true);
    try {
      setOrder(await confirmPayment(reference, user ? null : guestEmail));
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : "Could not check the payment. Please try again.");
    }
    setBusy(false);
  };

  if (!ready) return <p className="text-muted">Loading...</p>;

  // Guest on a new device or tab: prove ownership with the order's email
  if (!user && !guestEmail) {
    return (
      <form onSubmit={submitEmail} className="max-w-md space-y-4 rounded-3xl border border-black/10 p-6">
        <p className="text-lg font-semibold">Confirm your email</p>
        <p className="text-sm text-muted">
          Enter the email you used for order <strong className="text-ink">{reference}</strong>. Or{" "}
          <Link href="/login" className="underline underline-offset-4">sign in</Link> if you have an account.
        </p>
        <input
          type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@example.com"
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
        {emailError && <p role="alert" className="text-sm text-red-600">{emailError}</p>}
        <button type="submit" className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase">
          View order
        </button>
      </form>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-muted">
          Ordered as a guest? <Link href="/track" className="underline underline-offset-4">Track it with your email</Link>.
        </p>
      </div>
    );
  }
  if (!order) return <p className="text-muted">{window.location.search ? "Confirming your payment..." : "Loading your order..."}</p>;

  const isPending = order.status === "pending";

  return (
    <div className="max-w-3xl space-y-8">
      {/* Status banner: changes with the order's payment state */}
      {isPending ? (
        <div className="rounded-3xl border border-black/10 p-6">
          <div className="flex items-start gap-4">
            <Clock className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-lg font-semibold">Awaiting payment</p>
              <p className="text-sm text-muted">
                Reference <strong className="text-ink">{order.reference}</strong>. Your order is reserved once you pay.
              </p>
              {returned && (
                <p className="mt-2 text-sm text-red-600">We haven&apos;t received your payment yet. You can try again below.</p>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={pay}
              disabled={busy}
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
            >
              {busy ? "Please wait..." : `Pay ${naira.format(order.total)}`}
            </button>
            <button onClick={checkAgain} disabled={busy} className="text-sm font-medium text-muted underline underline-offset-4 hover:text-accent">
              I&apos;ve already paid, check again
            </button>
          </div>
          {payError && <p className="mt-3 text-sm text-red-600">{payError}</p>}
        </div>
      ) : (
        <div className="flex items-start gap-4 rounded-3xl bg-accent/10 p-6">
          <CheckCircle2 className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-lg font-semibold">{order.status === "paid" ? "Payment received. Thank you!" : order.statusLabel}</p>
            <p className="text-sm text-muted">
              Reference <strong className="text-ink">{order.reference}</strong> · {order.statusLabel}
            </p>
            <p className="mt-1 text-sm text-muted">We send updates to <strong className="text-ink">{order.email}</strong>.</p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-black/10 rounded-3xl border border-black/10 px-6">
        {order.items.map((i, n) => (
          <li key={n} className="flex gap-4 py-5">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
              {i.image && <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />}
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