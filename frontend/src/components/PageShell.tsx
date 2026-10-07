// No "use client": it only arranges other components, so it can render on the server.

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// eyebrow = small orange label, title = big heading, intro = short line under it,
// children = whatever the page puts inside (form, FAQ list, policy text...)
export default function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string; // the ? means optional
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* pt-40 leaves room for the fixed announcement bar + navbar */}
      <main className="px-6 pt-40 pb-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
          <div className="mt-12">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}