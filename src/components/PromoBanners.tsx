import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function PromoBanners() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Banner 1: Caps & Apparel (Dark Teal/Forest Green) */}
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-surface-border bg-gradient-to-br from-[#0c4033] to-[#072d24] text-white p-6 flex flex-col justify-between min-h-[220px] group">
            <div className="relative z-10 max-w-[65%]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-light">
                STUDY • EXPLORE • BE PROUD
              </span>
              <h3 className="text-xl font-extrabold mt-1 tracking-tight text-white leading-snug">
                NSTU Caps & Apparel
              </h3>
              <Link
                href="/category/caps-apparel"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-navy font-bold text-xs hover:bg-surface-soft transition shadow"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-[45%] h-[90%] overflow-hidden">
              <Image
                src="/assets/banners/banner-caps.jpg"
                alt="NSTU Caps"
                fill
                className="object-contain object-right-bottom group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Banner 2: Mugs & Drinkware (Soft Sky Blue) */}
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-[#cbe1f7] bg-gradient-to-br from-[#EAF3FB] to-[#d6e8fb] text-navy p-6 flex flex-col justify-between min-h-[220px] group">
            <div className="relative z-10 max-w-[65%]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                CAMPUS MEMORIES
              </span>
              <h3 className="text-xl font-extrabold mt-1 tracking-tight text-navy leading-snug">
                Good Things Remind You of Home
              </h3>
              <p className="text-xs text-brandText-secondary mt-1">NSTU Mugs & Drinkware</p>
              <Link
                href="/category/mugs-drinkware"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-navy text-white font-bold text-xs hover:bg-navy-deep transition shadow"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-[45%] h-[90%] overflow-hidden">
              <Image
                src="/assets/banners/banner-mugs.jpg"
                alt="NSTU Mugs"
                fill
                className="object-contain object-right-bottom group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Banner 3: Bags & Accessories (Deep Navy Blue) */}
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-surface-border bg-gradient-to-br from-[#103B70] to-[#08284F] text-white p-6 flex flex-col justify-between min-h-[220px] group">
            <div className="relative z-10 max-w-[65%]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                CAMPUS GEAR
              </span>
              <h3 className="text-xl font-extrabold mt-1 tracking-tight text-white leading-snug">
                Carry Your Dreams
              </h3>
              <p className="text-xs text-slate-300 mt-1">NSTU Bags & Accessories</p>
              <Link
                href="/category/bags-accessories"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-navy font-bold text-xs hover:bg-surface-soft transition shadow"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-[45%] h-[90%] overflow-hidden">
              <Image
                src="/assets/banners/banner-bags.jpg"
                alt="NSTU Bags"
                fill
                className="object-contain object-right-bottom group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
