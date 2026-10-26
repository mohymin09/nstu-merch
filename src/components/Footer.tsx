"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
  ShieldCheck,
} from "lucide-react";
import { StoreSettings, SocialLink } from "@/lib/db/types";

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      })
      .catch(() => {});
  }, []);

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      default:
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.05c1.47 1.05 3.28 1.68 5.23 1.68v-3.5a4.8 4.8 0 0 1-1.32-.54z" />
          </svg>
        );
    }
  };

  const payments = settings?.payment_methods;

  return (
    <footer className="relative bg-navy-dark text-white pt-12 pb-6 overflow-hidden">
      {/* Decorative Wave Divider at Top */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-emerald-400 to-navy-light" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={settings?.logo_url || "/assets/nstu-logo.png"}
                  alt="NSTU Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  {settings?.store_name || "NSTU MERCH"}
                </span>
                <span className="text-xs font-serif italic text-emerald-400 tracking-wide">
                  {settings?.tagline || "Wear Your Pride."}
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed">
              Proudly inspired by Noakhali Science and Technology University. Our merchandise
              connects you to the spirit, culture, and memories of NSTU.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition"
                  title={link.label}
                >
                  {renderSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Shop
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{settings?.address || "NSTU, Noakhali Bangladesh"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{settings?.phone || "+880 1812 345678"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{settings?.email || "nstu.merch@gmail.com"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{settings?.business_hours || "9:00 AM – 6:00 PM (Sat – Thu)"}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Methods (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4">
              Payment Methods
            </h4>
            <div className="space-y-2.5">
              {payments?.cod?.is_enabled && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="w-9 h-7 rounded bg-amber-600/30 flex items-center justify-center font-bold text-xs text-amber-300">
                    COD
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-200">Cash on Delivery</span>
                    <span className="text-[11px] text-slate-400">({payments.cod.account_number})</span>
                  </div>
                </div>
              )}

              {payments?.bkash?.is_enabled && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="w-9 h-7 rounded bg-pink-700/40 flex items-center justify-center font-bold text-xs text-pink-300">
                    bKash
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-200">bKash Personal</span>
                    <span className="text-[11px] text-slate-400">({payments.bkash.account_number})</span>
                  </div>
                </div>
              )}

              {payments?.nagad?.is_enabled && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="w-9 h-7 rounded bg-orange-700/40 flex items-center justify-center font-bold text-xs text-orange-300">
                    Nagad
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-200">Nagad Personal</span>
                    <span className="text-[11px] text-slate-400">({payments.nagad.account_number})</span>
                  </div>
                </div>
              )}

              {payments?.rocket?.is_enabled && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="w-9 h-7 rounded bg-purple-700/40 flex items-center justify-center font-bold text-xs text-purple-300">
                    Rocket
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-200">Rocket Personal</span>
                    <span className="text-[11px] text-slate-400">({payments.rocket.account_number})</span>
                  </div>
                </div>
              )}

              {payments?.cash?.is_enabled && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="w-9 h-7 rounded bg-emerald-700/40 flex items-center justify-center font-bold text-xs text-emerald-300">
                    Cash
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-200">Campus Pickup</span>
                    <span className="text-[11px] text-slate-400">({payments.cash.account_number})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 NSTU Merch. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/privacy-policy" className="hover:text-emerald-400 transition">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-emerald-400 transition">
              Terms &amp; Conditions
            </Link>
            <span>|</span>
            <Link href="/return-policy" className="hover:text-emerald-400 transition">
              Return &amp; Refund Policy
            </Link>
            <span>|</span>
            <Link href="/track-order" className="hover:text-emerald-400 transition font-semibold text-emerald-400">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
