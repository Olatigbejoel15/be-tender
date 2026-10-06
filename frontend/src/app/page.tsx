import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip"; // Section 2
import FeaturedDrops from "@/components/FeaturedDrops"; // Section 3

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandStrip />
        <FeaturedDrops />
        {/* Sections 4 to 8 will be added here, one per phase */}
      </main>
    </>
  );
}