"use client"; // uses state, timers and animations, so it must run in the browser

import { useEffect, useState } from "react"; // useState = memory, useEffect = timer
import Image from "next/image"; // Next's optimized image component
import { motion, type Variants } from "framer-motion"; // animations
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from "lucide-react"; // arrow + the 3 trust icons

// pos = which part of the photo to keep when it has to be cropped: "x% y%"
// 50% 50% = center. 50% 20% = keep the top (faces). Change per photo to taste.
const slides = [
  { src: "/hero/hero-1.jpg", alt: "Woman lifting weights in the gym", pos: "50% 30%" },
  { src: "/hero/hero-2.jpg", alt: "Man doing a deadlift", pos: "50% 30%" },
  { src: "/hero/hero-3.jpg", alt: "Group fitness class training together", pos: "50% 30%" },
  { src: "/hero/hero-4.jpg", alt: "Athlete running on a treadmill", pos: "50% 30%" },
  { src: "/hero/hero-5.jpg", alt: "Boxing training session", pos: "50% 30%" },
  { src: "/hero/hero-6.jpg", alt: "Woman stretching after a workout", pos: "50% 30%" },
];

const SLIDE_TIME = 4000; // time each photo stays, in milliseconds (4 seconds)

// Reusable entrance animation: each element passes a number (custom) so they appear one after another
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 }, // start: invisible, 24px lower
  show: (i: number) => ({
    opacity: 1, // end: visible
    y: 0, // end: normal position
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" }, // later items wait longer
  }),
};

// The three small trust points under the buttons
const perks = [
  { icon: Truck, label: "Free delivery over ₦50k" },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: ShieldCheck, label: "Secure payment" },
];

export default function Hero() {
  const [index, setIndex] = useState(0); // which photo is showing (0 = first)

  // Every time "index" changes, start a 4-second timer, then move to the next photo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length); // % wraps back to 0 after the last photo
    }, SLIDE_TIME);
    return () => clearTimeout(timer); // cancel the old timer before a new one starts
  }, [index]);

  return (
    // pt-[97px] pushes the hero below the fixed announcement bar + navbar
    <div className="bg-white pt-[97px]">
      {/* The hero box: fills the visible screen height, never shorter than 600px */}
      <section
        id="home"
        className="relative h-[calc(100svh-97px)] min-h-[600px] overflow-hidden bg-sand"
      >
        {/* LAYER 1: all photos stacked, only the active one is visible (crossfade) */}
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <motion.div
              key={slide.src}
              className="absolute inset-0"
              initial={{ opacity: i === 0 ? 1 : 0 }} // first photo is visible immediately
              animate={{ opacity: i === index ? 1 : 0 }} // active = visible, others = hidden
              transition={{ duration: 1.2, ease: "easeInOut" }} // 1.2s smooth fade
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill // stretch to fill the whole hero box
                priority={i === 0} // load the first photo right away
                quality={90} // sharper than the default 75
                sizes="100vw"
                className="object-cover" // ALWAYS fill the entire space (no empty sides)
                style={{ objectPosition: slide.pos }} // keep the focus point of THIS photo in view
              />
            </motion.div>
          ))}
        </div>

        {/* LAYER 2: the glass box on the left */}
        <div className="absolute inset-0 z-10 flex items-end px-4 pb-6 sm:px-8 lg:items-center lg:px-16 lg:pb-0">
          {/* The box: thin light border + faint dark tint + tiny blur, so the photo stays clear */}
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/25 bg-linear-to-br from-black/35 to-black/10 p-6 shadow-xl backdrop-blur-[3px] sm:p-10">
            {/* Pill label */}
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-[11px] font-medium tracking-[0.25em] text-white uppercase backdrop-blur-sm sm:text-xs"
            >
              New Season · 2026
            </motion.span>

            {/* Headline: "you move." is in the accent orange */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-5 text-4xl leading-[1.05] font-medium tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl"
            >
              Built for the way <span className="text-accent">you move.</span>
            </motion.h1>

            {/* Paragraph */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 max-w-lg text-base leading-relaxed text-white/90 drop-shadow sm:text-lg"
            >
              Breathable, sculpting gym wear made for real training. Soft on
              your skin, serious about performance.
            </motion.p>

            {/* Both buttons sit in one row. flex-wrap drops the second one below on narrow phones. */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-wrap gap-3"
            >
              {/* Primary button: accent orange */}
              <motion.a
                href="#drops"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg"
              >
                Shop the Drop <ArrowRight size={16} />
              </motion.a>

              {/* Secondary button: clear glass with a white edge, so it matches the box */}
              
            </motion.div>

            {/* Trust row: hidden on phones (keeps the box short), shown from sm screens up */}
            <motion.ul
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-7 hidden flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90 drop-shadow sm:flex"
            >
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon size={18} className="text-white" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>
    </div>
  );
}