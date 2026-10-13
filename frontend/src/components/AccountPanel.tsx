"use client"; // uses state from the login and the router

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountPanel() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  // Once we know nobody is signed in, send them to the sign-in page
  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return <p className="text-muted">Loading...</p>;

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  // One row of the details card
  const row = (label: string, value: string) => (
    <div className="flex flex-wrap justify-between gap-2 border-b border-black/10 py-4 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      {/* Details */}
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-semibold">Your details</h2>
        <dl className="mt-4">
          {row("Name", user.name)}
          {row("Email", user.email)}
          {row("Phone", user.phone ?? "Not added")}
        </dl>
        <button
          onClick={signOut}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold transition hover:border-ink"
        >
          <LogOut size={16} /> Sign out
        </button>
      </section>

      {/* Orders: placeholder until checkout exists */}
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
    </div>
  );
}