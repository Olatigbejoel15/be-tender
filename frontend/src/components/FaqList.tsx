"use client"; // uses state (which question is open) and Framer Motion

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { faqs } from "@/data/faqs";

export default function FaqList() {
  // Which question is open? null = none. Only one is open at a time.
  const [open, setOpen] = useState<number | null>(0); // starts with the first one open

  return (
    <div className="mx-auto max-w-3xl space-y-3">

      {faqs.map((faq, i) => {
        const isOpen = open === i; // is THIS question the open one?
        return (
          <div key={faq.question} className="glass overflow-hidden rounded-2xl">
            {/* The question row is a button. Clicking opens it, or closes it if already open. */}
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen} // tells screen readers whether it's open
              className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
            >
              {faq.question}
              {/* The plus rotates 45 degrees into an X when open */}
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-accent">
                <Plus size={20} />
              </motion.span>
            </button>

            {/* AnimatePresence lets the answer animate out before it's removed.
                height 0 to "auto" makes it slide open smoothly. */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <p className="px-5 pb-5 leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}