import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | BE TENDER",
};

export default function CheckoutPage() {
  return (
    <PageShell eyebrow="Checkout" title="Checkout">
      <CheckoutForm />
    </PageShell>
  );
}