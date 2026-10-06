import Navbar from "@/components/Navbar"; // @/ means src/ (alias from Phase 1)
import Hero from "@/components/Hero";

export default function Home() {
  return (
    // A fragment <> ... </> groups elements without adding an extra HTML tag
    <>
      <Navbar />
      <main>
        <Hero />
        {/* Sections 2 to 8 will be added here, one per phase */}
      </main>
    </>
  );
}