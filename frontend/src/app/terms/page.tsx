import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LegalSection from "@/components/LegalSection";
import { site } from "@/data/site";
import { FREE_DELIVERY } from "@/lib/shop";

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
          <p>We currently deliver within Nigeria only. Delivery takes 1 to 3 working days in Lagos and 3 to 7 working days elsewhere. The delivery fee depends on your state and is shown at checkout before you pay. Orders of ₦{FREE_DELIVERY.toLocaleString("en-NG")} and above ship free.</p>
          <p>Delivery times are estimates, not guarantees. Delays caused by couriers or events outside our control are not our liability, but we&apos;ll keep you updated.</p>
        </LegalSection>

        <LegalSection title="4. Returns and refunds">
          <p>You may return an item within 7 days of delivery if it is unworn and its tags are still attached. Items with cut tags, or that have been worn or washed, cannot be returned. Contact us first at {site.email}.</p>
          <p>We pay the return shipping for orders delivered within Lagos. For orders delivered outside Lagos, we pay half of the return shipping. Refunds go back to your original payment method once we receive the return.</p>
          <p>If we sent you the wrong or a faulty item, contact us within 7 days of delivery and we will arrange a replacement or refund at our cost.</p>
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