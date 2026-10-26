"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  ShoppingCart,
  CreditCard,
  Image as ImageIcon,
  Share2,
  Settings,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Database,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Stock & Inventory", href: "/admin/stock", icon: Archive },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Hero Carousel", href: "/admin/carousel", icon: ImageIcon },
  { label: "Social Links", href: "/admin/social", icon: Share2 },
  { label: "Store Settings", href: "/admin/settings", icon: Settings },
  { label: "Database / Supabase", href: "/admin/database", icon: Database },
  { label: "Security", href: "/admin/security", icon: KeyRound },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isLoading, isAdmin, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/nstu-logo.png"
            alt="NSTU Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-extrabold text-sm tracking-tight">NSTU MERCH ADMIN</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-navy text-white flex flex-col justify-between shadow-xl transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-5 border-b border-navy-light/40 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/assets/nstu-logo.png"
                  alt="NSTU Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-black text-base tracking-tight block">NSTU ADMIN</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Store Management
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-300 hover:bg-navy-light/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-navy-light/40 space-y-2 bg-navy-dark">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-light/30 text-xs font-semibold text-slate-200 hover:bg-navy-light/60 transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 hover:text-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
