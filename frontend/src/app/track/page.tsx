import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import TrackOrderForm from "@/components/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track your order | BE TENDER",
};

export default function TrackPage() {
  return (
    <PageShell eyebrow="Orders" title="Track your order">
      <TrackOrderForm />
    </PageShell>
  );
}