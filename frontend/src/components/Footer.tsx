// No "use client": the footer itself has no state, so it can render on the server.

import Link from "next/link";
import { categories } from "@/data/categories";
import { site } from "@/data/site"; // your business details
import SocialLinks from "@/components/SocialLinks"; // the round social icons
import FooterNewsletter from "@/components/FooterNewsletter"; // the email box
import Logo from "@/components/Logo";

export default function Footer() {
  const year = new Date().getFullYear(); // the copyright year updates itself

  // Link styling written once and reused
  const link = "transition-colors hover:text-accent";

  return (
    // overflow-hidden clips the giant wordmark if it runs slightly wider than the screen
    <footer className="overflow-hidden border-t border-black/5 bg-sand">
      <div className="mx-auto max-w-7xl px-6 pt-16">
        {/* TOP ROW: brand + socials on the left, newsletter on the right */}
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Link href="/" aria-label="Be Tender home">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Breathable, sculpting gym wear made for real training, designed to
              move with you.
            </p>
            <SocialLinks className="mt-6" />
          </div>

          <div className="lg:justify-self-end">
            <FooterNewsletter />
          </div>
        </div>

        {/* LINK COLUMNS: 2 per row on phones, 4 on large screens */}
        <div className="mt-14 grid grid-cols-2 gap-10 border-t border-black/10 pt-12 lg:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase">Shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {/* Built from categories.ts, so a new category appears here by itself */}
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/shop/${cat.slug}`} className={link}>{cat.name}</Link>
                </li>
              ))}
              <li><Link href="/#drops" className={link}>New Drops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><Link href="/#why" className={link}>Why Be Tender</Link></li>
              <li><Link href="/#lookbook" className={link}>Lookbook</Link></li>
              <li><Link href="/#reviews" className={link}>Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase">Help</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><Link href="/faq" className={link}>FAQs</Link></li>
              <li><Link href="/contact" className={link}>Contact</Link></li>
              <li><Link href="/privacy" className={link}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={link}>Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><a href={`mailto:${site.email}`} className={link}>{site.email}</a></li>
              <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className={link}>{site.phone}</a></li>
              <li>{site.address}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* GIANT WORDMARK.
          text-[17.5vw] = font size is 17.5% of the screen width, so it scales with the screen.
          leading-none removes extra line height. whitespace-nowrap keeps it on ONE line.
          text-ink/[0.07] = the ink color at only 7% strength: visible but quiet.
          select-none + aria-hidden: it's decoration, so it can't be selected or read aloud. */}
      <div
        aria-hidden
        className="mt-10 text-center text-[19.5vw] leading-none font-bold tracking-tighter whitespace-nowrap text-ink/[0.07] select-none"
      >
        BE TENDER
      </div>

      {/* COPYRIGHT: centered under the wordmark */}
      <div className="px-6 pt-4 pb-8 text-center text-xs text-muted">
        <p>© {year} {site.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}