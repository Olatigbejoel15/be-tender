import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqHero from "@/components/FaqHero"; // hero + why fit matters
import FaqList from "@/components/FaqList"; // the questions (unchanged)
import FaqCta from "@/components/FaqCta"; // closing write-up + Shop Now

export const metadata: Metadata = {
  title: "FAQs & About | BE TENDER",
  description: "Learn about Be Tender, why fit matters in the gym, and get answers about delivery, returns and sizing.",
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero + why a good gym fit matters */}
        <FaqHero />

        {/* 2. The FAQ list. id="questions" is where the hero button scrolls to.
            scroll-mt-28 stops the fixed navbar from covering the heading. */}
        <section id="questions" className="scroll-mt-28 bg-sand px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                FAQs
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Questions, answered.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Everything you need to know about ordering, delivery and
                returns. Can't find your answer? <a href="/contact" className="font-semibold text-accent underline underline-offset-4">Contact us</a>.
              </p>
            </div>
            <FaqList />
          </div>
        </section>

        {/* 3. Closing write-up ending with the Shop Now button */}
        <div className="pt-24">
          <FaqCta />
        </div>
      </main>
      <Footer />
    </>
  );
}