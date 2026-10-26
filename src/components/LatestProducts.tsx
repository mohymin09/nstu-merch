"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/db/types";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";

interface LatestProductsProps {
  products: Product[];
}

export default function LatestProducts({ products }: LatestProductsProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 bg-surface-soft border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Latest Products
            </h2>
            <p className="text-sm text-brandText-secondary mt-1">
              Explore our newest arrivals and campus favorites.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-primary transition"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.slice(0, 5).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
