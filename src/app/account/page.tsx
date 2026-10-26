"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, Clock, ShieldCheck, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/lib/db/types";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch("/api/admin/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) {
            const myOrders = data.orders.filter(
              (o: Order) =>
                (user.email && o.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
                (user.phone && o.customer_phone.includes(user.phone))
            );
            setOrders(myOrders);
          }
        })
        .catch(() => {});
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-navy-soft text-navy font-black text-2xl flex items-center justify-center border border-navy/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-navy">{user.name}</h1>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-brandText-secondary mt-0.5">{user.email}</p>
              <p className="text-xs text-brandText-muted font-mono">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-deep text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <ShieldCheck className="w-4 h-4" /> Open Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-surface-border hover:bg-surface-soft text-red-600 text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Customer Orders */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex justify-between items-center border-b border-surface-border pb-4">
            <div>
              <h2 className="text-base font-extrabold text-navy">My Merchandise Orders</h2>
              <p className="text-xs text-brandText-secondary">
                Track status and past deliveries of your campus merchandise
              </p>
            </div>
            <Link
              href="/shop"
              className="px-4 py-2 bg-primary hover:bg-primary-deep text-white text-xs font-bold rounded-xl transition shadow"
            >
              Shop New Items
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-brandText-secondary">
              <p>You haven&apos;t placed any orders with this account yet.</p>
              <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">
                Start shopping the NSTU collection &rarr;
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {orders.map((o) => (
                <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy text-sm">{o.order_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {o.order_status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-brandText-muted mt-1">
                      {new Date(o.created_at).toLocaleDateString()} • {o.items.length} item(s) • Method: {o.payment_method.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-navy text-sm">৳ {o.total}</span>
                    <Link
                      href={`/order-confirmation/${o.order_number}`}
                      className="px-3.5 py-1.5 rounded-lg border border-surface-border text-navy font-bold hover:bg-surface-soft"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
