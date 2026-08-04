import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await req.json();
    
    // Validate if contract exists
    const contract = await prisma.contract.findUnique({ where: { id: params.id } });
    
    if (!contract) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "SIGNED") {
      return NextResponse.json({ success: false, error: "Contract already signed" }, { status: 400 });
    }

    // Save signature
    await prisma.signature.create({
      data: {
        contractId: contract.id,
        imageUrl: data.signatureData,
        signerName: data.signerName,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown"
      }
    });

    // Update contract status
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "SIGNED" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error signing contract:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
