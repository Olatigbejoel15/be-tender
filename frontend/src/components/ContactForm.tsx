"use client"; // uses state (typed text) and Framer Motion, so it runs in the browser

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

// The dropdown choices. Edit this list to match what customers ask you.
const topics = [
  "Order or delivery help",
  "Sizing advice",
  "Returns and exchanges",
  "Collaboration or wholesale",
  "Something else",
];

// Starting (empty) values for every field
const empty = { name: "", email: "", phone: "", topic: topics[0], message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty); // one object holds all the fields
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  // Updates ONE field and keeps the rest as they were
  const update = (field: keyof typeof empty, value: string) => {
    setForm({ ...form, [field]: value });
    if (status !== "idle") setStatus("idle"); // clear old messages while typing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // stop the page from reloading

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    // Name, email and message are required. Phone is optional.
    if (!form.name.trim() || !form.message.trim() || !validEmail) {
      setStatus("error");
      return;
    }

    // TODO (Phase 9): send "form" to the Laravel API. For now it only shows the success message.
    setStatus("success");
    setForm(empty); // clear the form
  };

  // Shared input styling, written once and reused by every field
  const input =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

  return (
    // noValidate: we show our own error message instead of the browser's pop-up
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">Fields marked * are required.</p>

      <div className="mt-6 space-y-5">
        {/* Name + email side by side on tablets and up */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={label}>Full name *</label>
            <input id="name" className={input} placeholder="Ada Obi" value={form.name}
              onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className={label}>Email *</label>
            <input id="email" type="email" className={input} placeholder="ada@email.com" value={form.email}
              onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>

        {/* Phone + topic side by side */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={label}>Phone (optional)</label>
            <input id="phone" type="tel" className={input} placeholder="+234 800 000 0000" value={form.phone}
              onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label htmlFor="topic" className={label}>Topic</label>
            <select id="topic" className={input} value={form.topic}
              onChange={(e) => update("topic", e.target.value)}>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className={label}>Message *</label>
          <textarea id="message" className={`${input} min-h-36 resize-none`} placeholder="Tell us how we can help..."
            value={form.message} onChange={(e) => update("message", e.target.value)} />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg sm:w-auto"
        >
          Send message <Send size={16} />
        </motion.button>

        {/* Message area. min-h reserves space so the form doesn't jump. */}
        <div className="min-h-6 text-sm">
          <AnimatePresence mode="wait">
            {status === "error" && (
              <motion.p key="e" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-600">
                Please add your name, a valid email and a message.
              </motion.p>
            )}
            {status === "success" && (
              <motion.p key="s" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 font-medium text-green-700">
                <CheckCircle2 size={18} /> Message received. We&apos;ll reply within 24 hours.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}