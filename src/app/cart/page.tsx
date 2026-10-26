"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-surface-soft min-h-[70vh] flex items-center justify-center py-16">
        <div className="bg-white rounded-3xl border border-surface-border p-10 max-w-md w-full text-center shadow-card">
          <div className="w-20 h-20 rounded-full bg-surface-alt text-navy mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy">Your Cart is Empty</h2>
          <p className="text-sm text-brandText-secondary mt-2">
            Looks like you haven&apos;t added any NSTU merchandise to your cart yet.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-deep text-white font-bold text-sm transition shadow"
          >
            Explore Merchandise <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-navy">Shopping Cart</h1>
            <p className="text-sm text-brandText-secondary mt-0.5">
              Review your items ({itemCount}) before placing your order
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:underline font-semibold"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Table / Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-surface-border shadow-card divide-y divide-surface-border overflow-hidden">
              {items.map((item) => (
                <div key={item.variant_id} className="p-5 flex flex-col sm:flex-row items-center gap-4">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl bg-surface-alt border border-surface-border overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url || "/assets/nstu-logo.png"}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <Link
                      href={`/product/${item.product_slug}`}
                      className="text-base font-bold text-navy hover:text-primary transition line-clamp-1"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-brandText-secondary mt-0.5">
                      Variant: <span className="font-semibold text-brandText-primary">{item.variant_label}</span>
                    </p>
                    <p className="text-xs text-brandText-muted">SKU: {item.sku}</p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="text-base font-extrabold text-primary">
                        ৳ {item.unit_price}
                      </span>
                      {item.regular_price > item.unit_price && (
                        <span className="text-xs text-brandText-muted line-through">
                          ৳ {item.regular_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center border border-surface-border rounded-lg bg-surface-soft">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="p-1.5 text-brandText-secondary hover:text-navy"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-navy">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="p-1.5 text-brandText-secondary hover:text-navy"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-navy">
                        ৳ {item.unit_price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="p-1 text-red-500 hover:text-red-700 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card space-y-5">
              <h3 className="text-base font-extrabold text-navy border-b border-surface-border pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brandText-secondary">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-bold text-navy">৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-brandText-secondary">
                  <span>Estimated Delivery</span>
                  <span className="text-xs font-semibold text-emerald-600">From ৳ 30 (Campus)</span>
                </div>
                <div className="border-t border-surface-border pt-3 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-navy">Estimated Total</span>
                  <span className="text-2xl font-black text-navy">৳ {subtotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-sm tracking-wide transition shadow flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="bg-surface-soft p-3.5 rounded-xl border border-surface-border text-xs text-brandText-secondary space-y-1">
                <p className="font-semibold text-navy">University Student Guarantee</p>
                <p>Easy exchanges for size adjustments within 7 days at campus booth.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
