import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import FeaturedDrops from "@/components/FeaturedDrops";
import Categories from "@/components/Categories";
import WhyUs from "@/components/WhyUs";
import Lookbook from "@/components/Lookbook";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter"; // Section 8
import Footer from "@/components/Footer"; 

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
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}