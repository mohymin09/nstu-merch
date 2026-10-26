"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { HeroSlide } from "@/lib/db/types";

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export default function HeroCarousel({ slides: propSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(propSlides || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!propSlides || propSlides.length === 0) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.heroSlides && data.heroSlides.length > 0) {
            setSlides(data.heroSlides);
          }
        })
        .catch(() => {});
    }
  }, [propSlides]);

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (slides.length === 0) {
    return (
      <section className="relative bg-surface-alt py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-navy">Carry Your Campus.</h1>
          <p className="text-primary-deep italic text-2xl mt-1">Keep Your Memories.</p>
        </div>
      </section>
    );
  }

  const current = slides[currentIdx];

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="relative bg-gradient-to-r from-[#eef6f3] via-[#f7fafc] to-[#e8f1fa] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px]">
          {/* Left Text Column */}
          <div className="lg:col-span-6 z-10 space-y-4 text-center lg:text-left">
            <div className="inline-block px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-deep text-xs font-bold tracking-wider uppercase">
              {current.badge || "OFFICIAL NSTU MERCHANDISE"}
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy tracking-tight leading-tight">
                {current.title}
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-primary-deep font-bold">
                {current.subtitle}
              </p>
            </div>

            <p className="text-base text-brandText-secondary max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                href={current.cta_link || "/shop"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-deep text-white font-bold text-sm tracking-wide transition shadow-md hover:shadow-lg transform active:scale-95"
              >
                <span>{current.cta_text || "Shop Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Graphic Column */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg h-[280px] sm:h-[340px] md:h-[380px] rounded-2xl overflow-hidden shadow-xl border border-surface-border bg-white group">
              <Image
                src={current.desktop_image || "/assets/hero/hero-slide-1.jpg"}
                alt={current.title}
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition duration-700"
              />
              {/* Overlay with cursive watermark */}
              <div className="absolute top-4 right-4 bg-navy-deep/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-serif italic shadow">
                More than a University — It&apos;s a Family
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-navy shadow-md flex items-center justify-center transition border border-surface-border hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-navy shadow-md flex items-center justify-center transition border border-surface-border hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  currentIdx === idx
                    ? "w-7 h-2.5 bg-navy"
                    : "w-2.5 h-2.5 bg-navy/30 hover:bg-navy/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
