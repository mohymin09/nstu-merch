"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { StoreSettings, PaymentMethodType } from "@/lib/db/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [district, setDistrict] = useState("Noakhali");
  const [area, setArea] = useState("NSTU Campus");
  const [deliveryZone, setDeliveryZone] = useState<"campus" | "noakhali" | "outside">("campus");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  // Update contact defaults if user logs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="bg-surface-soft min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-surface-border text-center max-w-md shadow-card">
          <h2 className="text-xl font-bold text-navy">Your cart is empty</h2>
          <p className="text-xs text-brandText-secondary mt-1">
            Add university merchandise to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-deep"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Delivery fee calculation
  const deliveryFee =
    deliveryZone === "campus"
      ? settings?.delivery_fees?.campus ?? 30
      : deliveryZone === "noakhali"
      ? settings?.delivery_fees?.noakhali ?? 60
      : settings?.delivery_fees?.outside ?? 120;

  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage("Please fill in your full name, mobile number, and delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          delivery_address: deliveryAddress,
          district,
          area,
          delivery_zone: deliveryZone,
          order_notes: orderNotes || undefined,
          payment_method: paymentMethod,
          items: items.map((i) => ({
            variant_id: i.variant_id,
            quantity: i.quantity,
            variant_label: i.variant_label,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to process order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.order.order_number}`);
    } catch {
      setErrorMessage("Network error while submitting your order. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  const selectedPaymentConfig = settings?.payment_methods?.[paymentMethod];

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy">Checkout</h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Complete your order with secure delivery to your campus hall or home address
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Order Submission Notice</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer Info, Delivery, Payment (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Customer Details */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                  <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-base font-bold text-navy">Customer Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sabbir Ahmed"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Mobile Number (Bangladeshi 11 digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01812345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Email Address (Optional for order receipt)
                    </label>
                    <input
                      type="email"
                      placeholder="sabbir@student.nstu.edu.bd"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Zone & Address */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                  <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-base font-bold text-navy">Delivery Destination</h2>
                </div>

                {/* Zone Picker */}
                <div>
                  <label className="text-xs font-bold text-brandText-primary block mb-2">
                    Select Delivery Zone:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        deliveryZone === "campus"
                          ? "border-primary bg-primary/5 ring-2 ring-primary text-navy"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={deliveryZone === "campus"}
                        onChange={() => setDeliveryZone("campus")}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">NSTU Campus (Inside)</span>
                      <span className="text-xs font-extrabold text-primary mt-1 block">
                        ৳ {settings?.delivery_fees?.campus ?? 30}
                      </span>
                      <span className="text-[10px] text-brandText-muted block mt-0.5">
                        Hall / Faculty / Student Center (24 Hours)
                      </span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        deliveryZone === "noakhali"
                          ? "border-primary bg-primary/5 ring-2 ring-primary text-navy"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={deliveryZone === "noakhali"}
                        onChange={() => setDeliveryZone("noakhali")}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">Inside Noakhali</span>
                      <span className="text-xs font-extrabold text-primary mt-1 block">
                        ৳ {settings?.delivery_fees?.noakhali ?? 60}
                      </span>
                      <span className="text-[10px] text-brandText-muted block mt-0.5">
                        Maijdee / Sonapur / Sadar (1-2 Days)
                      </span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        deliveryZone === "outside"
                          ? "border-primary bg-primary/5 ring-2 ring-primary text-navy"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={deliveryZone === "outside"}
                        onChange={() => setDeliveryZone("outside")}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">All Bangladesh</span>
                      <span className="text-xs font-extrabold text-primary mt-1 block">
                        ৳ {settings?.delivery_fees?.outside ?? 120}
                      </span>
                      <span className="text-[10px] text-brandText-muted block mt-0.5">
                        Steadfast / RedX Express (2-4 Days)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Specific Address Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      District / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Area / Sub-district / Thana *
                    </label>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Full Delivery Address (Hall Room No / Department / House &amp; Road) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Bangabandhu Hall, Room 314, NSTU Campus"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-brandText-primary block mb-1">
                      Order Notes (Optional instructions for courier)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please call before arriving"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-navy bg-surface-soft"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                  <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h2 className="text-base font-bold text-navy">Payment Method</h2>
                </div>

                <div className="space-y-2.5">
                  {/* COD */}
                  {settings?.payment_methods?.cod?.is_enabled && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-0.5 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-navy block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-brandText-secondary block mt-0.5">
                          Pay cash directly to the delivery person upon receiving your parcel.
                        </span>
                      </div>
                    </label>
                  )}

                  {/* bKash */}
                  {settings?.payment_methods?.bkash?.is_enabled && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "bkash"
                          ? "border-pink-600 bg-pink-50/40 ring-2 ring-pink-600"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "bkash"}
                        onChange={() => setPaymentMethod("bkash")}
                        className="mt-0.5 text-pink-600 focus:ring-pink-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-pink-700 block">
                            bKash (Send Money)
                          </span>
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold">
                            Number: {settings.payment_methods.bkash.account_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-brandText-secondary block mt-0.5">
                          Send Money to {settings.payment_methods.bkash.account_number} ({settings.payment_methods.bkash.account_type}). You will enter your TrxID on the confirmation page.
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Nagad */}
                  {settings?.payment_methods?.nagad?.is_enabled && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "nagad"
                          ? "border-orange-600 bg-orange-50/40 ring-2 ring-orange-600"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "nagad"}
                        onChange={() => setPaymentMethod("nagad")}
                        className="mt-0.5 text-orange-600 focus:ring-orange-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-700 block">
                            Nagad (Send Money)
                          </span>
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                            Number: {settings.payment_methods.nagad.account_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-brandText-secondary block mt-0.5">
                          Send Money to {settings.payment_methods.nagad.account_number}. Submit Transaction ID upon order completion.
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Rocket */}
                  {settings?.payment_methods?.rocket?.is_enabled && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "rocket"
                          ? "border-purple-600 bg-purple-50/40 ring-2 ring-purple-600"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "rocket"}
                        onChange={() => setPaymentMethod("rocket")}
                        className="mt-0.5 text-purple-600 focus:ring-purple-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-700 block">
                            Rocket (Send Money)
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                            Number: {settings.payment_methods.rocket.account_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-brandText-secondary block mt-0.5">
                          Send Money to {settings.payment_methods.rocket.account_number}.
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Cash */}
                  {settings?.payment_methods?.cash?.is_enabled && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "cash"
                          ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600"
                          : "border-surface-border hover:border-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-600"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-emerald-800 block">
                          Cash Payment (Campus Booth Pickup)
                        </span>
                        <span className="text-[11px] text-brandText-secondary block mt-0.5">
                          Pay cash at NSTU Student Center booth when collecting your parcel.
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Instructions Box */}
                {selectedPaymentConfig && (
                  <div className="p-3.5 rounded-xl bg-surface-alt border border-surface-border text-xs text-brandText-secondary flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{selectedPaymentConfig.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                <h3 className="text-base font-extrabold text-navy border-b border-surface-border pb-3">
                  Items in Order ({items.length})
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-surface-border max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variant_id} className="py-2.5 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-surface-alt border border-surface-border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_url || "/assets/nstu-logo.png"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-navy truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-[10px] text-brandText-secondary truncate">
                          {item.variant_label}
                        </p>
                        <p className="text-[11px] text-brandText-muted">
                          Qty: {item.quantity} × ৳{item.unit_price}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-navy">
                        ৳ {item.unit_price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-surface-border pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-brandText-secondary">
                    <span>Subtotal</span>
                    <span className="font-bold text-navy">৳ {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-brandText-secondary">
                    <span>Delivery Charge ({deliveryZone})</span>
                    <span className="font-bold text-navy">৳ {deliveryFee}</span>
                  </div>
                  <div className="border-t border-surface-border pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-navy">Final Amount Payable</span>
                    <span className="text-2xl font-black text-primary">৳ {total}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-sm tracking-wide transition shadow flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    "Processing Order..."
                  ) : (
                    <>
                      Place Order (৳ {total}) <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-center text-brandText-muted flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure 256-Bit SSL Encrypted University Store</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
