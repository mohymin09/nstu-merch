import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const { order_id, payment_method, sender_number, transaction_id, reference_note, amount } = await req.json();

    if (!order_id || !payment_method || !sender_number || !transaction_id) {
      return NextResponse.json(
        { message: "Sender number and Transaction ID (TrxID) are required." },
        { status: 400 }
      );
    }

    const cleanSender = sender_number.replace(/[^0-9]/g, "");
    const cleanTrxId = transaction_id.trim().toUpperCase();

    // Verify order exists
    const order = await repository.getOrderById(order_id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const submission = await repository.submitPayment({
      order_id: order.id,
      order_number: order.order_number,
      payment_method,
      sender_number: cleanSender,
      transaction_id: cleanTrxId,
      reference_note: reference_note?.trim(),
      amount: amount || order.total,
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    return NextResponse.json({ message: "Error submitting payment verification" }, { status: 500 });
  }
}
