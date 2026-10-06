"use client"; // uses state, scroll tracking and Framer Motion, so it runs in the browser

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react"; // star + arrow icons
import { testimonials } from "@/data/testimonials"; // the 7 reviews
import { products } from "@/data/products"; // used to look up what each person bought

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null); // handle to the sideways-scrolling row
  const [canPrev, setCanPrev] = useState(false); // can we scroll left? (false at the start)
  const [canNext, setCanNext] = useState(true); // can we scroll right?

  // Checks the scroll position and enables/disables the arrows to match
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4); // scrolled away from the start
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4); // more cards to the right
  }, []);

  // Check once on load, and again whenever the window is resized
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows); // cleanup
  }, [updateArrows]);

  // Moves the row by one card (dir = 1 for right, -1 for left)
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("figure"); // measure the first card
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8; // 24 = the gap
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    // id="reviews" is the target of the "Reviews" navbar link
    <section id="reviews" className="relative scroll-mt-28 overflow-hidden px-6 py-24">
      {/* Soft accent glow behind the cards, so the glass has something to blur */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading row: title and the short write-up shown before the reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Reviews
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Loved by people who train.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Every Be Tender piece is made to be trained in, so we let the people
            wearing it do the talking. Here is what our customers say after
            their first workouts, and the pieces they chose.
          </p>
        </motion.div>

        {/* The row of cards.
            overflow-x-auto = scrolls sideways. snap-x snap-mandatory = stops neatly on each card.
            The two [..] classes hide the scrollbar. py-4 leaves room for the hover lift. */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          ref={trackRef}
          onScroll={updateArrows} // update the arrows while the row scrolls (also covers swiping)
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => {
            // Find the product this person bought, using the productId
            const bought = products.find((p) => p.id === t.productId);

            return (
              <motion.figure
                key={t.name}
                whileHover={{ y: -6 }} // micro-animation: lifts on hover
                // Width: 85% on phones (so the next card peeks in), 2 per row on tablets, 3 on large screens.
                // shrink-0 stops the cards from squeezing. snap-start aligns each card to the left edge.
                className="glass flex w-[85%] shrink-0 snap-start flex-col rounded-3xl p-8 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                {/* Stars */}
                <div className="flex gap-1 text-accent" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={18} className="fill-current" />
                  ))}
                </div>

                {/* Review text. flex-1 pushes everything below to the bottom, so all cards line up. */}
                <blockquote className="mt-5 flex-1 leading-relaxed">{t.text}</blockquote>

                {/* What they bought: product photo + name (only shown if the product was found) */}
                {bought && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                      <Image
                        src={bought.image}
                        alt={bought.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs tracking-wide text-muted uppercase">Purchased</p>
                      <p className="text-sm font-semibold">{bought.name}</p>
                    </div>
                  </div>
                )}

                {/* Person: initial in a circle + name and city */}
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted">{t.location}</span>
                  </span>
                </figcaption>
              </motion.figure>
            );
          })}
        </motion.div>

        {/* Arrow buttons: centered below the cards.
            Greyed out and unclickable when there's nowhere to go. */}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous reviews"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 bg-white transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/15"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next reviews"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}