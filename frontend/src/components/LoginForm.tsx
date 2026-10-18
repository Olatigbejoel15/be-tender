"use client"; // uses state, the router and Framer Motion

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/authApi";

export default function LoginForm() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // message shown under the button
  const [busy, setBusy] = useState(false); // true while we wait for the API

  // Signed in (just now, or already before)? Go to the account page.
      useEffect(() => {
    if (user) router.replace(user.role === "customer" ? "/account" : "/admin"); // staff go to the admin area
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // stop the page from reloading
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      // success: "user" is now set and the effect above redirects
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.email?.[0] ?? err.message) : "Something went wrong.");
      setBusy(false);
    }
  };

  // Same look as the contact form
  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

  return (
    <form onSubmit={submit} className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} placeholder="ada@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input id="password" type="password" required autoComplete="current-password" className={input}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"} <LogIn size={16} />
        </motion.button>

        {/* Error area. min-h reserves space so the form doesn't jump. */}
        <p role="alert" className="min-h-5 text-sm text-red-600">{error}</p>
      </div>

      <p className="mt-2 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent">
          Create an account
        </Link>
      </p>
    </form>
  );
}