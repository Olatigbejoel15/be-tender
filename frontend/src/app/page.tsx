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
import { getProducts } from "@/lib/api"; // data now comes from Laravel
import type { Product } from "@/types/product";

export default async function Home() {
  // One request for the whole catalogue. If the API is down, sections show empty instead of crashing.
  const products = await getProducts().catch(() => [] as Product[]);
  const featured = products.filter((p) => p.isFeatured); // the 4 flagged is_featured in the database

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandStrip />
        <FeaturedDrops products={featured} />
        <Categories products={products} />
        <WhyUs />
        <Lookbook />
        <Testimonials products={products} />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}