"use client"; // uses state (the typed email) and Framer Motion, so it runs in the browser

import { useState } from "react"; // memory for the email and the form status
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react"; // arrow + success tick

export default function Newsletter() {
  const [email, setEmail] = useState(""); // what the visitor has typed
  // status: "idle" = nothing yet, "error" = bad email, "success" = joined
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  // Runs when the form is submitted (button click or pressing Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // stop the browser from reloading the page

    // Simple check: some text, an @, some text, a dot, some text
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setStatus("error");
      return;
    }

    // TODO (Phase 9): send the email to the Laravel API here
    setStatus("success");
    setEmail(""); // clear the box
  };

  return (
    <section id="newsletter" className="relative overflow-hidden px-6 py-24">
      {/* Soft accent glows behind the card, so the glass has something to blur */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {/* The glass card, fades up when scrolled into view */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass relative mx-auto max-w-4xl rounded-[2rem] p-8 text-center sm:p-14"
      >
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          Join the list
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Get first access to every drop.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Join the Be Tender list for early access to new releases, restocks and
          member-only offers. No spam, unsubscribe any time.
        </p>

        {/* noValidate: we show our own error message instead of the browser's pop-up */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email} // the box always shows what's in state
            onChange={(e) => {
              setEmail(e.target.value); // update state on every keystroke
              if (status !== "idle") setStatus("idle"); // clear old messages while typing
            }}
            placeholder="Enter your email"
            aria-label="Email address"
            className="w-full flex-1 rounded-full border border-ink/15 bg-white px-6 py-4 text-sm outline-none transition focus:border-accent"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg"
          >
            Subscribe <ArrowRight size={16} />
          </motion.button>
        </form>

        {/* Message under the form. AnimatePresence lets it fade out when it disappears. */}
        <div className="mt-4 min-h-6 text-sm">
          <AnimatePresence mode="wait">
            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-600"
              >
                Please enter a valid email address.
              </motion.p>
            )}
            {status === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 font-medium text-green-700"
              >
                <CheckCircle2 size={18} /> You&apos;re on the list. Welcome to Be Tender!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}