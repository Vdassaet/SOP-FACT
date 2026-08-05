import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Generate invoice number INV-YYYYMMDD-UUID(4)
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${rand}`;

    const depositAmount = parseFloat(data.depositAmount) || 0;
    
    let initialStatus = "UNPAID";
    if (depositAmount >= data.total && data.total > 0) {
      initialStatus = "PAID";
    } else if (depositAmount > 0) {
      initialStatus = "PARTIAL";
    }

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: data.customerId,
        estimateId: data.estimateId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        status: initialStatus,
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

    if (depositAmount > 0) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          customerId: data.customerId,
          amount: depositAmount,
          method: data.paymentMethod || "Transfer",
          notes: "Deposit / Initial Payment recorded at invoice creation.",
        }
      });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (status) {
      if (status === 'UNPAID_OR_PARTIAL') {
        whereClause.status = { in: ['UNPAID', 'PARTIAL'] };
      } else {
        whereClause.status = status;
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { payments: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}