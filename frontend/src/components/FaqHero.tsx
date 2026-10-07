"use client"; // uses Framer Motion animations, so it runs in the browser

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Wind, Zap, Repeat } from "lucide-react"; // arrow + 4 benefit icons

// Reusable entrance animation: each element passes a number (custom) so they appear one after another
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 }, // start: invisible, 24px lower
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" }, // later items wait longer
  }),
};

// The four benefits. To add a fifth, add one more object (and an icon in the import).
const benefits = [
  {
    icon: Sparkles,
    title: "It lifts your confidence",
    text: "When your gym wear fits and flatters, you stop thinking about how you look and start focusing on the work.",
  },
  {
    icon: Wind,
    title: "It keeps you comfortable",
    text: "Breathable, quick-dry fabric keeps you cool in the heat, so discomfort is never your reason to stop early.",
  },
  {
    icon: Zap,
    title: "It moves with you",
    text: "A squat-proof, stretchy fit lets you lift, run and stretch freely, with no tugging and no readjusting.",
  },
  {
    icon: Repeat,
    title: "It builds the habit",
    text: "When you love what you're wearing, getting dressed for the gym feels like a treat. That's how consistency starts.",
  },
];

export default function FaqHero() {
  return (
    <>
      {/* PART 1: the hero. pt-40 leaves room for the fixed announcement bar + navbar. */}
      <section className="relative overflow-hidden bg-sand px-6 pt-40 pb-20">
        {/* Soft accent glow behind the photo, for depth */}
        <div className="pointer-events-none absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />

        {/* Two columns on large screens: text left, photo right */}
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* LEFT: the brand story */}
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="text-sm font-semibold tracking-[0.2em] text-accent uppercase"
            >
              About Be Tender
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Feel good in it. <span className="text-accent">Train better in it.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              Be Tender is a gym wear brand from Lagos. We make breathable,
              sculpting pieces for people who train for real, designed to stay
              soft on your skin and secure through every rep.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-4 max-w-xl text-lg leading-relaxed text-muted"
            >
              We believe the right outfit won't do the workout for you, but it
              will take away every excuse. Below you'll find why fit matters,
              and answers to the questions we hear most.
            </motion.p>

            {/* Button scrolls down to the FAQ list (id="questions" on the page) */}
            <motion.a
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              href="#questions"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase"
            >
              Jump to the FAQs <ArrowRight size={16} />
            </motion.a>
          </div>

          {/* RIGHT: photo with a small glass card on it */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-3xl bg-white"
          >
            {/* Reuses a hero photo. Change the path to any photo you prefer. */}
            <Image
              src="/hero/hero-1.jpg"
              alt="Athlete training in Be Tender gym wear"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="glass absolute right-5 bottom-5 left-5 rounded-2xl p-4">
              <p className="text-xs tracking-wide text-muted uppercase">Our promise</p>
              <p className="mt-1 font-semibold">Gym wear made to be trained in.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PART 2: why a good gym fit makes the gym better */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }} // animates when scrolled into view
            viewport={{ once: true }} // only the first time
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Why fit matters
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              A good gym fit makes every session better.
            </h2>
          </motion.div>

          {/* 1 column on phones, 2 on tablets, 4 on large screens */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }} // micro-animation: lifts on hover
                className="glass rounded-3xl p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={24} />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}