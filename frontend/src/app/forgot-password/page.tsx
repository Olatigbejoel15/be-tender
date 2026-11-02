import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | BE TENDER",
};

export default function ForgotPasswordPage() {
  return (
    <PageShell eyebrow="Account" title="Forgot your password?" intro="Enter your email and we'll send you a link to choose a new one.">
      <div className="mx-auto max-w-md">
        <ForgotPasswordForm />
      </div>
    </PageShell>
  );
}