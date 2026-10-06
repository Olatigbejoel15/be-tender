"use client"; // uses scroll tracking and Framer Motion, so it runs in the browser

import { useRef } from "react"; // useRef = a handle to a real element on the page
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { looks, type Look } from "@/data/lookbook"; // our photo list + its type

// One photo tile. It's its own component so each tile tracks its OWN scroll position.
function LookTile({ look, index }: { look: Look; index: number }) {
  const ref = useRef<HTMLDivElement>(null); // points at this tile's frame

  // scrollYProgress goes from 0 to 1 as the tile travels from entering the bottom
  // of the screen ("start end") to leaving the top ("end start")
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Turn that 0 to 1 number into movement: the photo slides from -8% to +8% of its height
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }} // entrance: invisible, 40px lower
      whileInView={{ opacity: 1, y: 0 }} // fades up when it scrolls into view
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      // overflow-hidden clips the photo to the rounded frame. "group" lets the photo react to hover.
      className={`group relative overflow-hidden rounded-3xl bg-white ${look.span}`}
    >
      {/* This wrapper is 120% tall and starts 10% above the frame, so when it moves
          up and down there's always photo behind the edges (no empty gaps). */}
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image
          src={look.src}
          alt={look.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105" // slow zoom on hover
        />
      </motion.div>

      {/* Small glass caption in the bottom-left corner */}
      <span className="glass absolute bottom-4 left-4 rounded-full px-4 py-2 text-xs font-semibold tracking-wide">
        {look.label}
      </span>
    </motion.div>
  );
}

export default function Lookbook() {
  return (
    // id="lookbook" is the target of the "Lookbook" navbar link and the hero button
    <section id="lookbook" className="scroll-mt-28 bg-sand px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              The Lookbook
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Train in style.
            </h2>
          </div>
          <a
            href="#drops"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
          >
            Shop the looks <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* The grid: 2 columns on phones, 4 on tablets and up.
            auto-rows sets every row's height, so tiles stay a consistent size. */}
        <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-4 md:auto-rows-[280px] md:grid-cols-4">
          {looks.map((look, i) => (
            <LookTile key={look.src} look={look} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}