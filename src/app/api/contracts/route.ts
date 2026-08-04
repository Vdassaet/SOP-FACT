import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Generate contract number CTR-YYYYMMDD-UUID(4)
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const contractNumber = `CTR-${dateStr}-${rand}`;

    const contract = await prisma.contract.create({
      data: {
        number: contractNumber,
        customerId: data.customerId,
        projectId: data.projectId || null,
        estimateId: data.estimateId || null,
        status: "DRAFT",
        warranty: data.warranty,
        responsibilities: data.responsibilities,
        paymentConditions: data.paymentConditions,
        cancellations: data.cancellations,
        permits: data.permits,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error("Error creating contract:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
