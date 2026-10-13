import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | BE TENDER",
};

export default function LoginPage() {
  return (
    <PageShell eyebrow="Account" title="Welcome back" intro="Sign in to see your details and orders.">
      <div className="max-w-md">
        <LoginForm />
      </div>
    </PageShell>
  );
}