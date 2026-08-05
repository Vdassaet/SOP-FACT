import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true, customer: true, payments: true }
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const data = await request.json();
    
    // Using a transaction to replace items
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete old items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: params.id }
      });
      
      // 2. Update invoice and insert new items
      const updated = await tx.invoice.update({
        where: { id: params.id },
        data: {
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          status: data.status,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          items: {
            create: data.items.map((i: any) => ({
              name: i.name,
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.quantity * i.unitPrice
            }))
          }
        }
      });
      return updated;
    });

    return NextResponse.json({ success: true, invoice: result });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    await prisma.invoice.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}

