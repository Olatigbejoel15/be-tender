"use client"; // reads the URL and uses state

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { ApiError, resetPasswordRequest } from "@/lib/authApi";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? ""; // both come from the link in the email
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false); // true after a successful reset
  const [busy, setBusy] = useState(false);

  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

  // Opened without the email's link: nothing to reset
  if (!token || !email) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
        <p className="text-lg font-semibold">This link is incomplete</p>
        <p className="mt-2 text-sm text-muted">Open the link from your email again, or ask for a new one.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent">
          Request a new link
        </Link>
      </div>
    );
  }

  // Success: send them to sign in (we don't sign them in automatically)
  if (done) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
        <p className="text-lg font-semibold">Password updated</p>
        <p className="mt-2 text-sm text-muted">You can now sign in with your new password. Any other devices were signed out.</p>
        <Link href="/login" className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg">
          Sign in
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Checks the API can't do alone: the confirm box only exists here
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");

    setBusy(true);
    try {
      await resetPasswordRequest({ token, email, password, password_confirmation: confirm });
      setDone(true);
    } catch (err) {
      // 422 carries per-field messages: show the first one (bad/expired link comes back on "email")
      setError(
        err instanceof ApiError
          ? (err.fields.email?.[0] ?? err.fields.password?.[0] ?? err.message)
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <div className="space-y-5">
        <p className="text-sm text-muted">Choosing a new password for <span className="font-medium text-ink">{email}</span></p>

        <div>
          <label htmlFor="password" className={label}>New password</label>
          <input id="password" type="password" required autoComplete="new-password" className={input} placeholder="8+ characters"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label htmlFor="confirm" className={label}>Confirm password</label>
          <input id="confirm" type="password" required autoComplete="new-password" className={input}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save new password"} <KeyRound size={16} />
        </motion.button>

        <p role="alert" className="min-h-5 text-sm text-red-600">{error}</p>
        {/* Shown when the link is expired or already used */}
        {error.includes("invalid or has expired") && (
          <Link href="/forgot-password" className="text-sm font-semibold underline underline-offset-4 hover:text-accent">
            Request a new link
          </Link>
        )}
      </div>
    </form>
  );
}