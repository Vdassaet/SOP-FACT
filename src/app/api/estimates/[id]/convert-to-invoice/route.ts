import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the estimate and its items
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    if (estimate.status === "INVOICED") {
      return NextResponse.json(
        { error: "Estimate is already converted to an invoice" },
        { status: 400 }
      );
    }

    // Generate Invoice Number (simple logic, should ideally be robust or use DB sequence)
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Use a transaction to ensure both operations succeed
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update estimate status
      const updatedEstimate = await tx.estimate.update({
        where: { id },
        data: { status: "INVOICED" },
      });

      // 2. Create the Invoice
      const newInvoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          customerId: estimate.customerId,
          estimateId: estimate.id,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days due date
          status: "UNPAID",
          subtotal: estimate.subtotal,
          tax: estimate.tax,
          discount: estimate.discount,
          total: estimate.total,
          items: {
            create: estimate.items.map(item => ({
              productId: item.productId,
              serviceId: item.serviceId,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          }
        },
      });

      return { updatedEstimate, newInvoice };
    });

    return NextResponse.json({ success: true, invoice: result.newInvoice });
  } catch (error) {
    console.error("Convert Estimate to Invoice Error:", error);
    return NextResponse.json(
      { error: "Failed to convert estimate to invoice" },
      { status: 500 }
    );
  }
}
