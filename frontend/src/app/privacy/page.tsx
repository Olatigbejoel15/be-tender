import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LegalSection from "@/components/LegalSection";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy | BE TENDER",
  description: "How Be Tender collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Last updated: October 2026. This explains what information we collect and how we use it."
    >
      <div className="max-w-3xl">
        <LegalSection title="1. Who we are">
          <p>{site.name} is an online gym wear store based in {site.address}. You can reach us at {site.email}.</p>
        </LegalSection>

        <LegalSection title="2. What we collect">
          <p>We collect only what we need to run the store: your name, email address, phone number and delivery address when you place an order or contact us, and your email address if you join our mailing list.</p>
          <p>Payments are handled by our payment partner. We never see or store your full card details.</p>
        </LegalSection>

        <LegalSection title="3. How we use it">
          <p>We use your information to process and deliver orders, answer your messages, send order updates, and, only if you've signed up, send news about new drops and offers.</p>
        </LegalSection>

        <LegalSection title="4. Sharing">
          <p>We share information only with services that help us run the store, such as payment and delivery partners, and only what they need. We do not sell your personal information.</p>
        </LegalSection>

        <LegalSection title="5. Your rights">
          <p>Under the Nigeria Data Protection Act 2023, you can ask to see, correct or delete the information we hold about you, and you can unsubscribe from marketing emails at any time. Email {site.email} to make a request.</p>
        </LegalSection>

        <LegalSection title="6. Cookies">
          <p>We use cookies to keep your cart working and to understand how the site is used. You can block cookies in your browser settings, but some features may stop working.</p>
        </LegalSection>

        <LegalSection title="7. Changes">
          <p>We may update this policy and will change the date above when we do.</p>
        </LegalSection>
      </div>
    </PageShell>
  );
}