import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import FeaturedDrops from "@/components/FeaturedDrops";
import Categories from "@/components/Categories"; // Section 4
import WhyUs from "@/components/WhyUs"; // Section 5

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
        {/* Sections 6 to 8 will be added here, one per phase */}
      </main>
    </>
  );
}