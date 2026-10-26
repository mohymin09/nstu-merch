import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  const payments = await repository.getPayments();
  return NextResponse.json({ payments });
}

export async function PATCH(req: Request) {
  try {
    const { payment_id, status } = await req.json();

    if (!payment_id || !status || (status !== "verified" && status !== "rejected")) {
      return NextResponse.json({ message: "Valid payment ID and status required" }, { status: 400 });
    }

    const updated = await repository.reviewPayment(payment_id, status, "Admin");
    if (!updated) {
      return NextResponse.json({ message: "Payment submission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment: updated });
  } catch {
    return NextResponse.json({ message: "Error reviewing payment" }, { status: 500 });
  }
}
