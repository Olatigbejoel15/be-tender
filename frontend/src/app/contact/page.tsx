import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin, Clock, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactHero from "@/components/ContactHero";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site"; // your business details
import SocialLinks from "@/components/SocialLinks";

// Sets the browser tab title and search description for this page
export const metadata: Metadata = {
  title: "Contact | BE TENDER",
  description: "Reach the Be Tender team about orders, sizing, returns or collaborations.",
};

// The three quick-contact cards. href makes each one tappable:
// mailto: opens the email app, tel: starts a call, the WhatsApp link opens a chat.
const quick = [
  { icon: Mail, label: "Email us", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Call us", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with the team", href: site.whatsapp },
];

// The reassurance list on the left
const promises = [
  "A real person replies within 24 hours",
  "Help choosing the right size and fit",
  "Order, delivery and return support",
  "Collaboration and wholesale enquiries",
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Photo banner with the glass title card */}
        <ContactHero />

        {/* 2. Quick-contact cards. -mt-16 pulls them up so they overlap the banner's bottom edge.
            relative z-10 keeps them above the photo. */}
        <section className="relative z-10 -mt-16 px-6">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
            {quick.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                // The WhatsApp link opens a new tab. mailto: and tel: stay in the same tab.
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="glass glass-strong glass-hover flex items-center gap-4 rounded-2xl p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs tracking-wide text-muted uppercase">{label}</span>
                  {/* truncate = long text ends with "..." instead of overflowing the card */}
                  <span className="block truncate text-sm font-semibold">{value}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* 3. Two columns: info on the left, form on the right */}
        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            {/* LEFT */}
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
                Get in touch
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                We&apos;re here to help you train better.
              </h2>
              {/* Short accent line under the heading, as a design detail */}
              <div className="mt-5 h-1 w-16 rounded-full bg-accent" />
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Questions about an order, unsure which size to pick, or want to
                work with us? Send a message and the right person will get back
                to you.
              </p>

              {/* The reassurance checklist */}
              <ul className="mt-8 space-y-4">
                {promises.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-accent" />
                    <span className="font-medium">{p}</span>
                  </li>
                ))}
              </ul>

              {/* Opening hours */}
              <div className="glass mt-10 flex items-center gap-4 rounded-2xl p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Clock size={22} />
                </span>
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">Support hours</p>
                  <p className="font-semibold">{site.hours}</p>
                </div>
              </div>

                {/* Social icons from site.ts */}
              <div className="mt-8">
                <p className="text-sm font-semibold">Follow along</p>
                <SocialLinks className="mt-3" />
              </div>
            </div>

            {/* RIGHT: the form */}
            <ContactForm />
          </div>
        </section>

        {/* 4. Map with an address card on top */}
        <section className="relative h-[420px] bg-sand">
          {/* Google's free embed: no API key needed. It searches for your address. */}
          <iframe
            title="Be Tender location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy" // only loads the map when the visitor scrolls near it
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Address card pinned to the corner of the map */}
          <div className="glass glass-strong absolute bottom-6 left-4 flex max-w-xs items-start gap-4 rounded-2xl p-5 sm:left-10">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MapPin size={20} />
            </span>
            <div>
              <p className="font-semibold">Find us</p>
              <p className="mt-1 text-sm text-muted">{site.address}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}