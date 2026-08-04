import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Generate invoice number INV-YYYYMMDD-UUID(4)
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${rand}`;

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: data.customerId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        status: "UNPAID",
        items: {
          create: data.items.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      }
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
