"use client"; // uses state and Framer Motion

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { ApiError, forgotPasswordRequest } from "@/lib/authApi";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false); // true once the API has answered
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // stop the page from reloading
    setError("");
    setBusy(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true); // same screen for known and unknown emails
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.email?.[0] ?? err.message) : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

  // After sending: a confirmation instead of the form
  if (sent) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
        <p className="text-lg font-semibold">Check your email</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          If <span className="font-medium text-ink">{email.trim()}</span> has an account, a reset link is on its
          way. It stays valid for 60 minutes. Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} placeholder="ada@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send reset link"} <Mail size={16} />
        </motion.button>

        <p role="alert" className="min-h-5 text-sm text-red-600">{error}</p>
      </div>

      <p className="mt-2 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent">
          Sign in
        </Link>
      </p>
    </form>
  );
}