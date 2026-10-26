"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Eye, Check } from "lucide-react";
import { Product, ProductVariant } from "@/lib/db/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();

  // Find default active variant
  const defaultVariant = product.variants?.[0] || {
    id: `var-${product.id}`,
    product_id: product.id,
    sku: product.sku,
    attributes: {},
    regular_price: product.regular_price,
    sale_price: product.sale_price,
    stock_quantity: product.stock_quantity,
    image_url: product.images[0],
    is_active: true,
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const displayPrice = selectedVariant.sale_price ?? selectedVariant.regular_price;
  const originalPrice = selectedVariant.regular_price;
  const hasDiscount = selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.regular_price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const currentImage = selectedVariant.image_url || product.images[0] || "/assets/nstu-logo.png";
  const isOutOfStock = selectedVariant.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const variantLabel = Object.entries(selectedVariant.attributes)
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
      quantity: 1,
      image_url: currentImage,
      max_stock: selectedVariant.stock_quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl border border-surface-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden">
          <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.is_new && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                New
              </span>
            )}
            {product.is_bestseller && (
              <span className="px-2.5 py-0.5 rounded-full bg-navy text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                Best Seller
              </span>
            )}
            {product.is_featured && !product.is_new && !product.is_bestseller && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#103B70] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                Popular
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            aria-label="Add to wishlist"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center shadow-sm hover:scale-110 transition z-10"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-navy"
              }`}
            />
          </button>

          {/* Quick View Button (hover) */}
          {onQuickView && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
                className="w-full py-2 bg-white/95 hover:bg-white text-navy text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Quick View
              </button>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4">
          <span className="text-xs font-semibold text-brandText-secondary uppercase tracking-wider">
            {product.category_name || "Merchandise"}
          </span>

          <Link href={`/product/${product.slug}`} className="block mt-1">
            <h3 className="text-sm sm:text-base font-bold text-navy hover:text-primary transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Price Row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base sm:text-lg font-extrabold text-navy">
              ৳ {displayPrice}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs sm:text-sm text-brandText-muted line-through">
                  ৳ {originalPrice}
                </span>
                <span className="text-[11px] font-bold text-primary bg-[#EAF5F0] px-1.5 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Color / Variant Swatches */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex items-center gap-1.5 mt-3 pt-1">
              {product.variants.slice(0, 4).map((variant) => {
                const isSelected = variant.id === selectedVariant.id;
                const colorValue = variant.attributes["Colour"] || variant.attributes["Color"] || variant.attributes["Design"] || variant.sku;

                return (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    title={Object.values(variant.attributes).join(" - ")}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                      isSelected
                        ? "border-primary bg-primary text-white font-bold"
                        : "border-surface-border text-brandText-secondary hover:border-navy"
                    }`}
                  >
                    {colorValue}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-200 shadow-sm ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isAdded
              ? "bg-primary-deep text-white"
              : "bg-primary hover:bg-primary-deep text-white active:scale-98"
          }`}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
