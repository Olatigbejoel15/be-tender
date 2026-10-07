"use client"; // uses state, effects, the router and Framer Motion

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // lets us send the visitor to another page from code
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { searchProducts } from "@/lib/search";
import { naira } from "@/lib/format";

const suggestions = ["Leggings", "Joggers", "Bottle", "Sports bra"]; // shown before anything is typed

// The inside of the panel. It only exists while the panel is open, so its state
// (the typed text) starts empty each time it opens, with no reset code needed.
function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState(""); // what the visitor has typed
  const text = query.trim();
  const results = searchProducts(text).slice(0, 5); // best 5 matches

  // While open: Escape closes it, and the page behind can't scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Enter key: go to the full results page
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); // stop the page from reloading
    if (!text) return;
    router.push(`/search?q=${encodeURIComponent(text)}`); // encodeURIComponent makes the text safe for a web address
    onClose();
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      {/* The search box */}
      <form onSubmit={submit} className="flex items-center gap-3 rounded-full border border-ink/15 px-5 transition focus-within:border-accent">
        <Search size={20} className="shrink-0 text-muted" />
        <input
          autoFocus // the cursor is in the box as soon as it opens
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search gym wear..."
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted"
        />
        <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-2 transition hover:bg-black/5">
          <X size={18} />
        </button>
      </form>

      {/* Nothing typed yet: show suggestions. Typed with matches: show products. No matches: say so. */}
      <div className="mt-5 max-h-[60vh] overflow-y-auto">
        {!text ? (
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition hover:border-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No products found for &ldquo;{text}&rdquo;. Try another word.</p>
        ) : (
          <>
            <ul className="divide-y divide-black/10">
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 py-3 transition hover:opacity-80">
                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                      <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-xs text-muted">{p.category}</span>
                    </span>
                    <span className="font-semibold">{naira.format(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={submit}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase"
            >
              See all results <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// The wrapper: dark backdrop + the panel, animated in and out
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // clicking the dark area closes it
          className="fixed inset-0 z-[80] bg-black/40"
          aria-hidden
        />
      )}
      {open && (
        <motion.div
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-[90] rounded-b-3xl bg-white shadow-2xl"
        >
          <SearchPanel onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}