"use client"; // reads the signed-in user

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SuperOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) return <p className="text-muted">Loading...</p>;

  if (user?.role !== "super_admin") {
    return (
      <div className="max-w-md rounded-2xl border border-black/10 bg-white p-6">
        <p className="font-semibold">Super admins only</p>
        <p className="mt-1 text-sm text-muted">Ask a super admin if you need access to this page.</p>
        <Link href="/admin" className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-accent">Back to the dashboard</Link>
      </div>
    );
  }

  return <>{children}</>;
}