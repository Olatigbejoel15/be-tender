"use client"; // uses auth state, the router and the current path

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, LayoutDashboard, LogOut, Package, ScrollText, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = { href: string; label: string; icon: LucideIcon; superOnly?: boolean; soon?: boolean };

// Set soon to false when that screen is built
const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag,  },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Boxes, soon: true },
  { href: "/admin/audit-log", label: "Audit log", icon: ScrollText, superOnly: true, soon: true },
  { href: "/admin/staff", label: "Staff", icon: Users, superOnly: true, soon: true },
];

const ROLE_LABEL = { admin: "Admin", super_admin: "Super admin", customer: "Customer" } as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();

  // Nobody signed in: send them to the sign-in page
  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return <p className="p-8 text-muted">Loading...</p>;

  // Signed in, but a customer: no access
  if (user.role === "customer") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">No access</h1>
        <p className="mt-3 text-muted">This area is for BE TENDER staff only.</p>
        <Link href="/account" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white">
          Back to my account
        </Link>
      </div>
    );
  }

  const items = NAV.filter((n) => !n.superOnly || user.role === "super_admin"); // hide what this role can't use
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const signOut = async () => {
    await logout();
    router.push("/login");
  };

  // One sidebar / top-bar link (greyed out while the screen isn't built)
  const link = (n: NavItem, mobile = false) => {
    const Icon = n.icon;
    const base = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap ${mobile ? "" : "w-full"}`;
    if (n.soon) {
      return (
        <span key={n.href} className={`${base} cursor-not-allowed text-muted/60`}>
          <Icon size={18} /> {n.label} <span className="ml-auto rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase">Soon</span>
        </span>
      );
    }
    return (
      <Link key={n.href} href={n.href}
        className={`${base} transition ${isActive(n.href) ? "bg-accent text-white" : "hover:bg-black/5"}`}>
        <Icon size={18} /> {n.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-sand md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-white p-5 md:flex">
        <Link href="/admin" className="text-lg font-semibold tracking-wide">BE TENDER</Link>
        <p className="text-xs tracking-[0.2em] text-accent uppercase">Admin</p>
        <nav className="mt-8 flex flex-col gap-1">{items.map((n) => link(n))}</nav>
        <div className="mt-auto border-t border-black/10 pt-4">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
          <Link href="/" className="mt-3 block text-xs text-muted underline underline-offset-4 hover:text-accent">View shop</Link>
          <button onClick={signOut} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold hover:text-accent">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phone top bar: brand, sign out, scrolling menu */}
        <header className="border-b border-black/5 bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">BE TENDER <span className="text-xs text-accent uppercase">Admin</span></span>
            <button onClick={signOut} aria-label="Sign out" className="p-1"><LogOut size={18} /></button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">{items.map((n) => link(n, true))}</nav>
        </header>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}