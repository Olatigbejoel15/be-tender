import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import AccountPanel from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "My account | BE TENDER",
};

export default function AccountPage() {
  return (
    <PageShell eyebrow="Account" title="My account">
      <AccountPanel />
    </PageShell>
  );
}