import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LegalSection from "@/components/LegalSection";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | BE TENDER",
  description: "The terms for shopping with Be Tender.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="Last updated: October 2026. By using our website and placing an order, you agree to these terms."
    >
      <div className="max-w-3xl">
        <LegalSection title="1. Orders">
          <p>Placing an order is an offer to buy. We confirm it by email, and we may cancel an order if an item is out of stock or a price was shown in error, in which case you'll be refunded in full.</p>
        </LegalSection>

        <LegalSection title="2. Prices and payment">
          <p>All prices are in Nigerian naira (₦). Payment is taken when you place the order through our secure payment partner.</p>
        </LegalSection>

        <LegalSection title="3. Delivery">
          <p>Delivery times shown are estimates, not guarantees. Delays caused by couriers or events outside our control are not our liability, but we'll keep you updated.</p>
        </LegalSection>

        <LegalSection title="4. Returns and refunds">
          <p>Unworn items with tags can be returned within 30 days of delivery. Contact us first at {site.email}. Refunds go back to your original payment method once the return is received.</p>
        </LegalSection>

        <LegalSection title="5. Intellectual property">
          <p>The Be Tender name, logo, photos and designs belong to us. Please don't copy or reuse them without written permission.</p>
        </LegalSection>

        <LegalSection title="6. Contact">
          <p>Questions about these terms? Email {site.email}.</p>
        </LegalSection>
      </div>
    </PageShell>
  );
}