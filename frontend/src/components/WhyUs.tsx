"use client"; // uses Framer Motion

import { motion } from "framer-motion";
import { Wind, Dumbbell, Sun, Truck } from "lucide-react"; // one icon per reason

// The four reasons. To add a fifth, add one more object (and an icon in the import).
const reasons = [
  {
    icon: Wind,
    title: "Breathable fabric",
    text: "Lightweight, quick-dry material that keeps you cool through the toughest set.",
  },
  {
    icon: Dumbbell,
    title: "Squat-proof fit",
    text: "Opaque, sculpting and secure, so you can train without a second thought.",
  },
  {
    icon: Sun,
    title: "Made for Lagos heat",
    text: "Designed for warm weather, so you stay comfortable from the gym to the street.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    text: "Quick delivery nationwide, free on orders over ₦50,000.",
  },
];

export default function WhyUs() {
  return (
    // id="why" is the target of the "Why Us" navbar link
    <section id="why" className="scroll-mt-28 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Centered heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Why Be Tender
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Gym wear that works as hard as you.
          </h2>
        </motion.div>

        {/* 1 column on phones, 2 on tablets, 4 on large screens */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6 }} // micro-animation: the card lifts when hovered
              className="glass rounded-3xl p-7"
            >
              {/* Icon badge: the icon tilts slightly when you hover the badge */}
              <motion.span
                whileHover={{ rotate: -8, scale: 1.1 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"
              >
                <Icon size={24} />
              </motion.span>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}