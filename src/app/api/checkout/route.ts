import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { OrderItem } from "@/lib/db/types";

// In-memory rate-limiter & duplicate click guard
const recentSubmissions = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      district,
      area,
      delivery_zone,
      order_notes,
      payment_method,
      items,
    } = body;

    // 1. Basic validation
    if (!customer_name || !customer_phone || !delivery_address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Please provide all required delivery details and at least one item." },
        { status: 400 }
      );
    }

    // 2. Phone normalization (Bangladeshi 11 digits: 01XXXXXXXXX)
    const cleanPhone = customer_phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith("01") && !cleanPhone.startsWith("8801"))) {
      return NextResponse.json(
        { message: "Please enter a valid Bangladeshi mobile number (e.g., 01812345678)." },
        { status: 400 }
      );
    }

    // 3. Duplicate submission protection (prevent double-clicks within 5 seconds)
    const idempotencyKey = `${cleanPhone}-${JSON.stringify(items.map((i: any) => i.variant_id))}`;
    const now = Date.now();
    const lastTime = recentSubmissions.get(idempotencyKey);
    if (lastTime && now - lastTime < 5000) {
      return NextResponse.json(
        { message: "An identical order was submitted moments ago. Please wait." },
        { status: 429 }
      );
    }
    recentSubmissions.set(idempotencyKey, now);

    // 4. Server-Side Price & Variant Recalculation
    const settings = await repository.getSettings();
    const allProducts = await repository.getProducts(true);
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of items) {
      let foundProduct = undefined;
      let foundVariant = undefined;

      for (const prod of allProducts) {
        const v = prod.variants.find((vr) => vr.id === clientItem.variant_id);
        if (v) {
          foundProduct = prod;
          foundVariant = v;
          break;
        }
      }

      if (!foundProduct || !foundVariant) {
        return NextResponse.json(
          { message: `Product variant could not be found or is unavailable.` },
          { status: 400 }
        );
      }

      if (foundVariant.stock_quantity < clientItem.quantity) {
        return NextResponse.json(
          {
            message: `Only ${foundVariant.stock_quantity} left in stock for ${foundProduct.name} (${clientItem.variant_label || foundVariant.sku}). Please adjust quantity.`,
          },
          { status: 400 }
        );
      }

      // Exact server unit price (prefer sale_price if active)
      const serverUnitPrice = foundVariant.sale_price ?? foundVariant.regular_price;
      const itemTotal = serverUnitPrice * clientItem.quantity;
      subtotal += itemTotal;

      const variantLabel = Object.entries(foundVariant.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" / ") || "Standard";

      validatedItems.push({
        id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product_id: foundProduct.id,
        variant_id: foundVariant.id,
        product_name: foundProduct.name,
        sku: foundVariant.sku,
        variant_label: variantLabel,
        unit_price: serverUnitPrice,
        quantity: clientItem.quantity,
        total_price: itemTotal,
        image_url: foundVariant.image_url || foundProduct.images[0] || "/assets/nstu-logo.png",
      });
    }

    // 5. Calculate delivery fee
    let deliveryFee = settings.delivery_fees.outside;
    if (delivery_zone === "campus") {
      deliveryFee = settings.delivery_fees.campus;
    } else if (delivery_zone === "noakhali") {
      deliveryFee = settings.delivery_fees.noakhali;
    }

    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    const initialOrderStatus = payment_method === "cod" || payment_method === "cash" ? "pending" : "awaiting_payment";

    // 6. Create order atomically in DB & Supabase
    const result = await repository.createOrder({
      customer_name: customer_name.trim(),
      customer_phone: cleanPhone,
      customer_email: customer_email ? customer_email.trim() : undefined,
      delivery_address: delivery_address.trim(),
      district: district ? district.trim() : "Noakhali",
      area: area ? area.trim() : "Campus",
      delivery_zone: delivery_zone || "campus",
      order_notes: order_notes ? order_notes.trim() : undefined,
      payment_method,
      payment_status: "unpaid",
      order_status: initialOrderStatus,
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      total,
      items: validatedItems,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ message: result.error || "Failed to create order" }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ message: "Server error processing order." }, { status: 500 });
  }
}
