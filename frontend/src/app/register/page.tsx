import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create account | BE TENDER",
};

export default function RegisterPage() {
  return (
    <PageShell eyebrow="Account" title="Create your account" intro="Save your details for faster checkout and track your orders.">
      <div className="max-w-xl">
        <RegisterForm />
      </div>
    </PageShell>
  );
}