"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/image";
import {
  Heart,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
} from "lucide-react";
import { Product, ProductVariant } from "@/lib/db/types";
import { useCart } from "@/context/CartContext";

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: `var-${product.id}`,
      product_id: product.id,
      sku: product.sku,
      attributes: {},
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      stock_quantity: product.stock_quantity,
      image_url: product.images[0],
      is_active: true,
    }
  );

  const [activeImage, setActiveImage] = useState<string>(
    selectedVariant.image_url || product.images[0] || "/assets/nstu-logo.png"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const displayPrice = selectedVariant.sale_price ?? selectedVariant.regular_price;
  const originalPrice = selectedVariant.regular_price;
  const hasDiscount =
    selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.regular_price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;
  const isOutOfStock = selectedVariant.stock_quantity <= 0;

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.image_url) {
      setActiveImage(v.image_url);
    }
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantLabel =
      Object.entries(selectedVariant.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" / ") || "Standard";

    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      product_slug: product.slug,
      sku: selectedVariant.sku,
      variant_label: variantLabel,
      unit_price: displayPrice,
      regular_price: originalPrice,
      quantity,
      image_url: activeImage,
      max_stock: selectedVariant.stock_quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Collect all gallery images
  const allImages = Array.from(
    new Set([
      ...product.images,
      ...product.variants.map((v) => v.image_url).filter(Boolean),
    ])
  ) as string[];

  return (
    <div className="bg-surface-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-brandText-secondary flex items-center gap-2 mb-6">
          <a href="/" className="hover:text-navy">
            Home
          </a>
          <span>/</span>
          <a href="/shop" className="hover:text-navy">
            Shop
          </a>
          <span>/</span>
          <a href={`/category/${product.category_id}`} className="hover:text-navy">
            {product.category_name}
          </a>
          <span>/</span>
          <span className="font-semibold text-primary">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Image Gallery (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl bg-surface-alt border border-surface-border overflow-hidden">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6"
                />
                {product.is_new && (
                  <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    New Arrival
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="absolute top-4 left-4 bg-navy text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-surface-alt flex-shrink-0 transition ${
                        activeImage === img ? "border-primary shadow" : "border-surface-border"
                      }`}
                    >
                      <Image src={img} alt="Thumbnail" fill className="object-contain p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details & Variant Selection (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {product.category_name}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
                      {product.name}
                    </h1>
                  </div>

                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    aria-label="Wishlist"
                    className="p-2.5 rounded-full bg-surface-soft hover:bg-surface-alt text-navy transition shadow-sm"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-navy"
                      }`}
                    />
                  </button>
                </div>

                {/* SKU & Stock Availability */}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-brandText-muted">
                    SKU: <strong className="text-brandText-primary">{selectedVariant.sku}</strong>
                  </span>
                  <span>•</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      isOutOfStock
                        ? "bg-red-100 text-red-700"
                        : selectedVariant.stock_quantity <= product.low_stock_threshold
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `In Stock (${selectedVariant.stock_quantity} available)`}
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4 pb-4 border-b border-surface-border">
                  <span className="text-3xl font-black text-navy">৳ {displayPrice}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-brandText-muted line-through font-medium">
                        ৳ {originalPrice}
                      </span>
                      <span className="text-xs font-bold text-primary bg-[#EAF5F0] px-2.5 py-1 rounded-full">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brandText-secondary mb-1">
                    Description
                  </h3>
                  <p className="text-sm text-brandText-primary leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Variant Options Selection */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mt-6 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-brandText-secondary block">
                      Choose Variation:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {product.variants.map((v) => {
                        const isSelected = v.id === selectedVariant.id;
                        const vLabel =
                          Object.entries(v.attributes)
                            .map(([key, val]) => `${val}`)
                            .join(" / ") || v.sku;

                        return (
                          <button
                            key={v.id}
                            onClick={() => handleVariantSelect(v)}
                            className={`p-3 rounded-xl border text-left transition ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary text-navy"
                                : "border-surface-border hover:border-navy text-brandText-primary"
                            }`}
                          >
                            <span className="text-xs font-bold block">{vLabel}</span>
                            <span className="text-[11px] font-semibold text-primary mt-0.5 block">
                              ৳ {v.sale_price ?? v.regular_price}
                            </span>
                            <span className="text-[10px] text-brandText-muted">
                              {v.stock_quantity > 0 ? `${v.stock_quantity} in stock` : "Sold out"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-surface-border rounded-xl bg-surface-soft">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3.5 py-2 text-sm font-bold text-navy hover:bg-surface-border rounded-l-xl transition disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-extrabold text-navy">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))
                      }
                      disabled={quantity >= selectedVariant.stock_quantity || isOutOfStock}
                      className="px-3.5 py-2 text-sm font-bold text-navy hover:bg-surface-border rounded-r-xl transition disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition duration-200 shadow-md ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isAdded
                        ? "bg-primary-deep text-white"
                        : "bg-primary hover:bg-primary-deep text-white hover:shadow-lg active:scale-98"
                    }`}
                  >
                    {isOutOfStock ? (
                      "Out of Stock"
                    ) : isAdded ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" /> Add to Cart — ৳ {displayPrice * quantity}
                      </>
                    )}
                  </button>
                </div>

                {/* Value Propositions */}
                <div className="mt-8 pt-6 border-t border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brandText-secondary">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Campus &amp; Nationwide Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Authentic University-Inspired Merchandise</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>7 Days Return &amp; Exchange Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-navy mb-6">Related Merchandise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <a
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="bg-white rounded-2xl border border-surface-border p-4 hover:shadow-card-hover transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-surface-alt overflow-hidden mb-3">
                    <Image
                      src={p.images[0] || "/assets/nstu-logo.png"}
                      alt={p.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">
                      {p.category_name}
                    </span>
                    <h4 className="text-sm font-bold text-navy group-hover:text-primary transition line-clamp-1">
                      {p.name}
                    </h4>
                    <span className="text-sm font-extrabold text-navy mt-1 block">
                      ৳ {p.sale_price ?? p.regular_price}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
