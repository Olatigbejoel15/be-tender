"use client"; // uses state (the typed email), so it runs in the browser

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { subscribeToNewsletter } from "@/lib/supportApi";

export default function FooterNewsletter() {
  const [email, setEmail] = useState(""); // what the visitor has typed
  const [website, setWebsite] = useState(""); // hidden bot trap, stays empty for real people
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorText, setErrorText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // stop the page from reloading

    // Simple shape check: text, an @, text, a dot, text
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorText("Please enter a valid email.");
      setStatus("error");
      return;
    }

    setBusy(true);
    try {
      await subscribeToNewsletter(email.trim(), website);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setErrorText(
        err instanceof ApiError && err.status === 429
          ? "Too many tries. Please wait a minute."
          : err instanceof ApiError
            ? (err.fields.email?.[0] ?? err.message)
            : "Something went wrong. Please try again."
      );
      setStatus("error");
    }
    setBusy(false);
  };

  return (
    <div>
      <p className="text-sm font-semibold tracking-wide uppercase">Join the list</p>
      <p className="mt-2 max-w-sm text-sm text-muted">
        First access to new drops, restocks and member offers.
      </p>

      {/* One pill: the input and the button sit inside the same rounded border */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative mt-4 flex max-w-md items-center rounded-full border border-ink/15 bg-white p-1.5 transition focus-within:border-accent"
      >
        {/* Bot trap: off-screen, skipped by keyboards and screen readers */}
        <input
          type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
          value={website} onChange={(e) => setWebsite(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle"); // clear old messages while typing
          }}
          placeholder="Your email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Subscribe"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-ink disabled:opacity-60"
        >
          <ArrowRight size={18} />
        </button>
      </form>

      {/* min-h reserves space so the footer doesn't jump when a message appears */}
      <p className="mt-2 min-h-5 text-xs">
        {status === "error" && <span role="alert" className="text-red-600">{errorText}</span>}
        {status === "success" && <span className="font-medium text-green-700">You&apos;re on the list. Welcome!</span>}
      </p>
    </div>
  );
}