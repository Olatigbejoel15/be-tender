"use client"; // uses Framer Motion, so it runs in the browser

import Link from "next/link"; // moves to another page without a full reload
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FaqCta() {
  return (
    <section className="relative overflow-hidden px-6 pb-24">
      {/* Soft glow behind the card, so the glass has something to blur */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass relative mx-auto max-w-4xl rounded-[2rem] p-8 text-center sm:p-14"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to feel the difference?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">
          You've read the answers, now find the fit that makes you want to show
          up. Browse our latest drops and train in something you love.
        </p>

        {/* Shop Now: goes to the Featured Drops section on the home page */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 inline-block"
        >
          <Link
            href="/#drops"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg"
          >
            Shop Now <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}