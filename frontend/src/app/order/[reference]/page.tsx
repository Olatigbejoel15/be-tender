import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata: Metadata = {
  title: "Your order | BE TENDER",
};

// Next.js 15+ passes route params as a Promise
export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return (
    <PageShell eyebrow="Order" title="Thank you">
      <OrderConfirmation reference={reference} />
    </PageShell>
  );
}