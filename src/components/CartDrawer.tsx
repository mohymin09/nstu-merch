"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, itemCount, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-light" />
              <h2 className="text-lg font-bold tracking-tight">Shopping Cart ({itemCount})</h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-navy-deep transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-surface-border">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center text-navy mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-brandText-primary">Your cart is empty</h3>
                <p className="text-sm text-brandText-secondary mt-1 max-w-xs">
                  Explore our authentic university merchandise and wear your pride!
                </p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-deep transition shadow-sm"
                >
                  Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant_id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-18 h-18 w-20 h-20 rounded-lg overflow-hidden bg-surface-alt border border-surface-border flex-shrink-0">
                    <Image
                      src={item.image_url || "/assets/nstu-logo.png"}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product_slug}`}
                      onClick={closeDrawer}
                      className="text-sm font-semibold text-brandText-primary hover:text-navy transition line-clamp-1"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-brandText-secondary mt-0.5">
                      {item.variant_label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">
                        ৳ {item.unit_price}
                      </span>
                      {item.regular_price > item.unit_price && (
                        <span className="text-xs text-brandText-muted line-through">
                          ৳ {item.regular_price}
                        </span>
                      )}
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-surface-border rounded-md bg-surface-soft">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 text-brandText-secondary hover:text-brandText-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-brandText-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 text-brandText-secondary hover:text-brandText-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="p-1 text-red-500 hover:text-red-700 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="border-t border-surface-border p-6 bg-surface-soft">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-brandText-secondary">Subtotal</span>
                <span className="text-lg font-bold text-navy">৳ {subtotal}</span>
              </div>
              <p className="text-xs text-brandText-muted mb-4">
                Delivery fee and payment options calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full text-center py-2.5 px-4 rounded-lg border border-navy text-navy font-semibold text-sm hover:bg-navy-soft transition"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-deep transition shadow flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
