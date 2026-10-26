import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const products = await repository.getProducts(true);
  const movements = await repository.getInventoryMovements();
  const variantsList: any[] = [];

  for (const p of products) {
    for (const v of p.variants) {
      variantsList.push({
        product_id: p.id,
        product_name: p.name,
        variant_id: v.id,
        sku: v.sku,
        attributes: v.attributes,
        stock_quantity: v.stock_quantity,
        low_stock_threshold: p.low_stock_threshold,
        status:
          v.stock_quantity <= 0
            ? "Out of Stock"
            : v.stock_quantity <= p.low_stock_threshold
            ? "Low Stock"
            : "In Stock",
      });
    }
  }

  return NextResponse.json({
    variants: variantsList,
    movements: movements.slice(0, 50),
  });
}

export async function POST(req: Request) {
  try {
    const { variant_id, change_quantity, reason } = await req.json();

    if (!variant_id || change_quantity === undefined || !reason) {
      return NextResponse.json({ message: "Variant ID, quantity adjustment, and reason are required" }, { status: 400 });
    }

    const res = await repository.adjustStock(variant_id, Number(change_quantity), reason, "Admin");
    if (!res.success) {
      return NextResponse.json({ message: res.error || "Failed to adjust stock" }, { status: 400 });
    }

    return NextResponse.json({ success: true, newStock: res.newStock });
  } catch {
    return NextResponse.json({ message: "Failed to adjust stock" }, { status: 500 });
  }
}
