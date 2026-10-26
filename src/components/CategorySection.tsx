"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Coffee,
  ShoppingBag,
  PenTool,
  Folder,
  Key,
  Gift,
  Star,
  Tag,
} from "lucide-react";
import { Category } from "@/lib/db/types";

interface CategorySectionProps {
  categories: Category[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-7 h-7 text-primary" />,
  Coffee: <Coffee className="w-7 h-7 text-primary" />,
  ShoppingBag: <ShoppingBag className="w-7 h-7 text-primary" />,
  PenTool: <PenTool className="w-7 h-7 text-primary" />,
  Folder: <Folder className="w-7 h-7 text-primary" />,
  Key: <Key className="w-7 h-7 text-primary" />,
  Gift: <Gift className="w-7 h-7 text-primary" />,
  Star: <Star className="w-7 h-7 text-primary" />,
};

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="h-[2px] w-12 bg-primary/30 rounded-full" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Shop by Category
            </h2>
            <span className="h-[2px] w-12 bg-primary/30 rounded-full" />
          </div>
          <p className="text-sm text-brandText-secondary">
            Find your favorite NSTU merchandise
          </p>
        </div>

        {/* 8 Circular Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 justify-center">
          {categories.map((cat) => {
            const iconComponent = ICON_MAP[cat.icon] || <Tag className="w-7 h-7 text-primary" />;

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center p-2 rounded-xl transition hover:-translate-y-1"
              >
                {/* Circular Icon Holder */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#EAF5F0] border-2 border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-lg">
                  <div className="transition-transform duration-300 group-hover:scale-110 group-hover:text-white [&>svg]:group-hover:text-white">
                    {iconComponent}
                  </div>
                </div>

                {/* Category Title */}
                <span className="mt-3 text-xs sm:text-sm font-semibold text-brandText-primary group-hover:text-primary transition line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
