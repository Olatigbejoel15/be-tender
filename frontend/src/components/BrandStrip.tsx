// No "use client" needed: this file uses only CSS animation, no state or Framer Motion.

// The words that scroll across the strip
const items = [
  "Breathable fabric",
  "Squat-proof",
  "Sculpting fit",
  "Quick-dry",
  "Made for Lagos heat",
  "4-way stretch",
];

export default function BrandStrip() {
  return (
    // overflow-hidden hides the part of the moving row that is off-screen
    <section className="overflow-hidden border-y border-black/5 bg-sand py-5">
      {/* w-max = as wide as its content. animate-marquee = our CSS animation.
          hover:[animation-play-state:paused] pauses it while the mouse is over it. */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* We render the list TWICE so the loop is seamless:
            when the first copy has scrolled out, the second sits exactly where it started. */}
        {[...items, ...items].map((item, i) => (
          <span
            key={i} // index as key is fine here: the list never changes
            className="flex items-center px-6 text-sm font-semibold tracking-[0.2em] whitespace-nowrap uppercase"
          >
            {/* Small orange dot before each phrase */}
            <span className="mr-12 h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}