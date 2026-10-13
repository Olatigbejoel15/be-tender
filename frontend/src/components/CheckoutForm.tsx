"use client"; // uses the cart, the login, state and the router

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/authApi";
import { placeOrder } from "@/lib/ordersApi";
import { naira } from "@/lib/format";

// Nigeria's 36 states + FCT (the API charges delivery by state)
const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo",
  "Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const FREE_DELIVERY = 50000; // keep in step with config/shop.php

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, ready } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Lagos");
  const [fields, setFields] = useState<Record<string, string[]>>({}); // per-field errors from Laravel
  const [error, setError] = useState(""); // general error message
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false); // stops the "empty cart" flash while we redirect
  const [prefilled, setPrefilled] = useState(false);

  // Fill name and phone from the account once (only while the fields are still empty)
  if (user && !prefilled) {
    setPrefilled(true);
    setName(user.name);
    setPhone(user.phone ?? "");
  }

  if (!ready) return <p className="text-muted">Loading...</p>;
  if (placed) return <p className="text-muted">Placing your order...</p>;

  // Empty cart: nothing to check out
  if (items.length === 0) {
    return (
      <div className="max-w-md">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase">
          Start shopping
        </Link>
      </div>
    );
  }

  // Orders belong to an account, so ask the customer to sign in first
  if (!user) {
    return (
      <div className="max-w-md rounded-3xl border border-black/10 p-8">
        <p className="text-lg font-semibold">Sign in to place your order</p>
        <p className="mt-1 text-sm text-muted">Your cart is saved and will be here when you come back.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase">Sign in</Link>
          <Link href="/register" className="rounded-full border border-ink/15 px-8 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase">Create account</Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFields({});
    setBusy(true);
    try {
      const order = await placeOrder({
        recipient_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state,
        // map cart lines to what the API expects (no prices are sent)
        items: items.map((i) => ({ product_id: i.productId, color: i.color, size: i.size, quantity: i.qty })),
      });
      setPlaced(true);
      clearCart(); // the order exists now, so empty the cart
      router.push(`/order/${order.reference}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  };

  // Item problems come back as items.0, items.1... (e.g. "does not come in ZZ")
  const itemErrors = Object.entries(fields).filter(([k]) => k.startsWith("items")).flatMap(([, v]) => v);

  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";
  const err = (k: string) => fields[k]?.[0] && <p className="mt-1 text-xs text-red-600">{fields[k][0]}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Delivery details */}
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10 lg:col-span-3">
        <h2 className="text-xl font-semibold">Delivery details</h2>

        <div>
          <label htmlFor="name" className={label}>Full name</label>
          <input id="name" required className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          {err("recipient_name")}
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone number</label>
          <input id="phone" type="tel" required className={input} placeholder="08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="address" className={label}>Street address</label>
          <input id="address" required className={input} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
          {err("address")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className={label}>City / area</label>
            <input id="city" required className={input} placeholder="Lekki" value={city} onChange={(e) => setCity(e.target.value)} />
            {err("city")}
          </div>
          <div>
            <label htmlFor="state" className={label}>State</label>
            <select id="state" className={input} value={state} onChange={(e) => setState(e.target.value)}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {err("state")}
          </div>
        </div>

        {/* Problems with specific items (sold out, wrong size...) */}
        {itemErrors.length > 0 && (
          <ul className="space-y-1 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {itemErrors.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        {error && itemErrors.length === 0 && <p className="text-sm text-red-600">{error}</p>}

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="w-full rounded-full bg-accent py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
        >
          {busy ? "Placing order..." : "Place order"}
        </motion.button>
      </form>

      {/* Order summary */}
      <aside className="h-fit rounded-3xl border border-black/10 p-6 sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <ul className="mt-4 divide-y divide-black/10">
          {items.map((i) => (
            <li key={i.key} className="flex gap-3 py-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted">{i.color} · {i.size} · Qty {i.qty}</p>
              </div>
              <p className="text-sm font-semibold">{naira.format(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{naira.format(subtotal)}</dd></div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="font-semibold">{subtotal >= FREE_DELIVERY ? "Free" : "Added by state"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">The final total, with delivery, is confirmed when you place the order.</p>
      </aside>
    </div>
  );
}