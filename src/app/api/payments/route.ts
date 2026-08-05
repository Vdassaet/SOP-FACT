import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { invoiceId, amount, method, notes } = data;

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        customerId: invoice.customerId,
        amount: parseFloat(amount),
        method: method || "Cash",
        notes: notes || "Payment recorded manually",
      }
    });

    // Update invoice status if fully paid
    const currentPaid = invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
    const newPaid = currentPaid + parseFloat(amount);
    
    let newStatus = invoice.status;
    if (newPaid >= invoice.total && invoice.total > 0) {
      newStatus = "PAID";
    } else if (newPaid > 0 && newPaid < invoice.total) {
      newStatus = "PARTIAL";
    }

    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus }
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
