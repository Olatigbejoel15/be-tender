"use client"; // uses Framer Motion animations, so it runs in the browser

import Image from "next/image";
import Link from "next/link"; // moves between pages without a full reload
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react"; // small arrow between breadcrumb items

export default function ContactHero() {
  return (
    // pt-[97px] pushes the banner below the fixed announcement bar + navbar
    <div className="bg-white pt-[97px]">
      <section className="relative h-[420px] overflow-hidden bg-sand sm:h-[480px]">
        {/* The photo. Swap the path for any photo you like. */}
        <Image
          src="/hero/hero-3.jpg"
          alt="Be Tender customers training together"
          fill
          priority // load immediately: it's the first thing on the page
          quality={90}
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />

        {/* A soft white fade ONLY at the very bottom, so the photo melts into the page.
            The rest of the photo stays fully clear. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent" />

        {/* Centered glass title card (pb-16 keeps it above the overlapping cards) */}
        <div className="absolute inset-0 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }} // start: invisible, 30px lower
            animate={{ opacity: 1, y: 0 }} // end: visible, in place
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl rounded-[2rem] border border-white/60 bg-white/70 px-6 py-8 text-center shadow-xl backdrop-blur-md sm:px-12 sm:py-10"
          >
            {/* Breadcrumb: shows where the visitor is */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1 text-xs font-medium text-muted">
              <Link href="/" className="transition-colors hover:text-accent">Home</Link>
              <ChevronRight size={14} />
              <span className="text-ink">Contact</span>
            </nav>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Let&apos;s <span className="text-accent">talk.</span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink/75 sm:text-lg">
              Whether it&apos;s an order, a fit question or a big idea, our team is
              one message away.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}