"use client"; // uses state, the router and the API

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/authApi";
import { getOrder, rememberGuestEmail } from "@/lib/ordersApi";

export default function TrackOrderForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const ref = reference.trim().toUpperCase(); // references are always capitals
    const mail = email.trim().toLowerCase();    // emails are saved lowercase

    try {
      await getOrder(ref, mail);                // checks the pair before we leave this page
      rememberGuestEmail(ref, mail);            // so the order page doesn't ask again
      router.push(`/order/${ref}`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "We couldn't find an order with that reference and email."
          : err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

  return (
    <form onSubmit={submit} className="max-w-md space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <p className="text-sm text-muted">
        Ordered without an account? Enter your order reference (from your receipt email) and the email you used.
        Customers with an account can find orders under My account.
      </p>
      <div>
        <label htmlFor="ref" className={label}>Order reference</label>
        <input id="ref" required className={input} placeholder="BT-XXXXXXXX" value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <div>
        <label htmlFor="mail" className={label}>Email</label>
        <input id="mail" type="email" required className={input} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-full bg-accent py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60">
        {busy ? "Checking..." : "Track order"}
      </button>
    </form>
  );
}