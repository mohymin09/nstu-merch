import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("payment_status");
  const query = searchParams.get("q")?.toLowerCase();

  let orders = await repository.getOrders();

  if (status && status !== "all") {
    orders = orders.filter((o) => o.order_status === status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    orders = orders.filter((o) => o.payment_status === paymentStatus);
  }

  if (query) {
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_phone.includes(query)
    );
  }

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { order_id, order_status, payment_status, cancellation_reason, courier_name, tracking_number, internal_notes } = body;

    if (!order_id) {
      return NextResponse.json({ message: "Order ID required" }, { status: 400 });
    }

    if (order_status) {
      await repository.updateOrderStatus(order_id, order_status, payment_status, "Admin", cancellation_reason);
    }

    if (courier_name !== undefined || tracking_number !== undefined || internal_notes !== undefined) {
      await repository.updateOrderShipping(order_id, courier_name || "", tracking_number || "", internal_notes, "Admin");
    }

    const updated = await repository.getOrderById(order_id);
    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
