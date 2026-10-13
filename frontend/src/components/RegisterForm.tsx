"use client"; // uses state, the router and Framer Motion

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/authApi";

const empty = { name: "", email: "", phone: "", password: "", confirm: "" };

export default function RegisterForm() {
  const router = useRouter();
  const { user, register } = useAuth();
  const [form, setForm] = useState(empty); // one object holds all the fields
  const [errors, setErrors] = useState<Record<string, string[]>>({}); // per-field messages from the API
  const [message, setMessage] = useState(""); // general message under the button
  const [busy, setBusy] = useState(false);

  // Signed in (just now, or already before)? Go to the account page.
  useEffect(() => {
    if (user) router.replace("/account");
  }, [user, router]);

  // Updates ONE field and keeps the rest as they were
  const update = (field: keyof typeof empty, value: string) => setForm({ ...form, [field]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    // Checks the API can't do for us: the confirm box only exists here
    if (form.password.length < 8) {
      setErrors({ password: ["Use at least 8 characters."] });
      return;
    }
    if (form.password !== form.confirm) {
      setErrors({ confirm: ["The passwords don't match."] });
      return;
    }

    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined, // empty phone is simply not sent
        password: form.password,
      });
      // success: "user" is now set and the effect above redirects
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields); // e.g. "The email has already been taken."
        if (Object.keys(err.fields).length === 0) setMessage(err.message);
      } else {
        setMessage("Something went wrong.");
      }
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";
  const fieldError = (name: string) =>
    errors[name]?.[0] ? <p className="mt-1.5 text-xs text-red-600">{errors[name][0]}</p> : null;

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className={label}>Full name</label>
          <input id="name" autoComplete="name" className={input} placeholder="Ada Obi"
            value={form.name} onChange={(e) => update("name", e.target.value)} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" autoComplete="email" className={input} placeholder="ada@email.com"
            value={form.email} onChange={(e) => update("email", e.target.value)} />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone (optional)</label>
          <input id="phone" type="tel" autoComplete="tel" className={input} placeholder="+234 800 000 0000"
            value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          {fieldError("phone")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={label}>Password</label>
            <input id="password" type="password" autoComplete="new-password" className={input} placeholder="8+ characters"
              value={form.password} onChange={(e) => update("password", e.target.value)} />
            {fieldError("password")}
          </div>
          <div>
            <label htmlFor="confirm" className={label}>Confirm password</label>
            <input id="confirm" type="password" autoComplete="new-password" className={input}
              value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
            {fieldError("confirm")}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Create account"} <UserPlus size={16} />
        </motion.button>

        <p role="alert" className="min-h-5 text-sm text-red-600">{message}</p>
      </div>

      <p className="mt-2 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent">
          Sign in
        </Link>
      </p>
    </form>
  );
}