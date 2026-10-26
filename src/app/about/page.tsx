import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-surface-soft min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-12 shadow-card space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src="/assets/nstu-logo.png"
                alt="NSTU Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              About NSTU Merch
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-navy mt-1">
              Wear Your Pride. Keep Your Memories.
            </h1>
            <p className="text-sm text-brandText-secondary mt-3 leading-relaxed">
              Proudly inspired by Noakhali Science and Technology University. Our merchandise is
              designed to connect students, alumni, faculty, and well-wishers to the enduring spirit
              and memories of our beloved campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-surface-border text-center">
            <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-sm">Authentic Craftsmanship</h3>
              <p className="text-xs text-brandText-secondary mt-1">
                Durable cotton fabrics, executive embossed notebooks, and genuine metal keychains.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border">
              <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-sm">Campus Community</h3>
              <p className="text-xs text-brandText-secondary mt-1">
                Designed for students by students. Affordable prices and express campus delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-soft border border-surface-border">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-sm">University Legacy</h3>
              <p className="text-xs text-brandText-secondary mt-1">
                Cherish the memories of NSTU whether you are currently studying or already an alumnus.
              </p>
            </div>
          </div>

          <div className="bg-[#EAF3FB] p-6 rounded-2xl border border-navy/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-bold text-navy text-sm">Looking for custom departmental orders?</h4>
              <p className="text-xs text-brandText-secondary mt-0.5">
                We organize bulk departmental batch T-shirts, hoodies, and event merchandise.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-navy hover:bg-navy-deep text-white text-xs font-bold transition flex items-center gap-2 flex-shrink-0"
            >
              Contact Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
