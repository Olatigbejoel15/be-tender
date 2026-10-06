import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import FeaturedDrops from "@/components/FeaturedDrops";
import Categories from "@/components/Categories";
import WhyUs from "@/components/WhyUs";
import Lookbook from "@/components/Lookbook"; // Section 6
import Testimonials from "@/components/Testimonials"; // Section 7

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandStrip />
        <FeaturedDrops />
        <Categories />
        <WhyUs />
        <Lookbook />
        <Testimonials />
        {/* Section 8 (newsletter + footer) comes in Phase 7 */}
      </main>
    </>
  );
}