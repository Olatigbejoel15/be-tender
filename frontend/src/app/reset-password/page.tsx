import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | BE TENDER",
};

export default function ResetPasswordPage() {
  return (
    <PageShell eyebrow="Account" title="Choose a new password">
      <div className="mx-auto max-w-md">
        {/* Suspense is required because the form reads the URL (useSearchParams) */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </PageShell>
  );
}