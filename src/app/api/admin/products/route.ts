import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { Product } from "@/lib/db/types";

export async function GET() {
  const products = await repository.getProducts(true);
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    const productData = await req.json();

    if (!productData.name || !productData.sku || !productData.regular_price) {
      return NextResponse.json({ message: "Name, SKU, and regular price are required." }, { status: 400 });
    }

    if (!productData.id) {
      productData.id = `prod-${Date.now()}`;
    }

    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    // Ensure variants have IDs
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((v: any, index: number) => ({
        ...v,
        id: v.id || `var-${productData.id}-${index}-${Date.now()}`,
        product_id: productData.id,
        regular_price: Number(v.regular_price) || Number(productData.regular_price),
        sale_price: v.sale_price ? Number(v.sale_price) : undefined,
        stock_quantity: Number(v.stock_quantity) || 0,
      }));
    } else {
      // Default single variant
      productData.variants = [
        {
          id: `var-${productData.id}-def`,
          product_id: productData.id,
          sku: productData.sku,
          attributes: { Edition: "Standard" },
          regular_price: Number(productData.regular_price),
          sale_price: productData.sale_price ? Number(productData.sale_price) : undefined,
          stock_quantity: Number(productData.stock_quantity) || 0,
          image_url: productData.images?.[0] || "/assets/nstu-logo.png",
          is_active: true,
        },
      ];
    }

    const saved = await repository.saveProduct(productData as Product, "Admin");
    return NextResponse.json({ success: true, product: saved });
  } catch (error) {
    console.error("Save product error:", error);
    return NextResponse.json({ message: "Error saving product." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    const ok = await repository.deleteProduct(id, "Admin");
    if (!ok) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
