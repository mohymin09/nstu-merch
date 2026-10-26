import { notFound } from "next/navigation";
import { db } from "@/lib/db/store";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: { slug: string };
}

export const revalidate = 0;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = db.getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product Not Found | NSTU Merch" };
  }
  return {
    title: `${product.name} — NSTU Merch`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | NSTU Merch`,
      description: product.description.slice(0, 160),
      images: [product.images[0] || "/assets/nstu-logo.png"],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = db.getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const allProducts = db.getProducts(false);
  const relatedProducts = allProducts.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  );

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
