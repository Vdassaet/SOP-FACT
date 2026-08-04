import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Fetch Estimate Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimate" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      customerId, date, expirationDate, installAddress, description,
      propertyType, projectType, priority, estimatedInstallDate,
      laborCrewSize, laborEstimatedHours, laborHourlyRate,
      machineryCost, permitCost, transportCost, disposalCost, overheadPercent,
      linearFeet, height, gateCount, gateWidth,
      linePosts, cornerPosts, terminalPosts,
      margin, status, subtotal, tax, discount, totalAmount,
      items
    } = body;

    // Use transaction to update estimate and its items
    const updatedEstimate = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.estimateItem.deleteMany({
        where: { estimateId: id }
      });

      // Update estimate
      const est = await tx.estimate.update({
        where: { id },
        data: {
          customerId,
          date: date ? new Date(date) : undefined,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          estimatedInstallDate: estimatedInstallDate ? new Date(estimatedInstallDate) : null,
          installAddress,
          description,
          propertyType,
          projectType,
          priority,
          laborCrewSize,
          laborEstimatedHours,
          laborHourlyRate,
          machineryCost,
          permitCost,
          transportCost,
          disposalCost,
          overheadPercent,
          linearFeet,
          height,
          gateCount,
          gateWidth,
          linePosts,
          cornerPosts,
          terminalPosts,
          margin,
          status,
          subtotal,
          tax: tax || 0.0,
          discount: discount || 0.0,
          total: totalAmount,
        }
      });

      // Recreate items
      if (items && items.length > 0) {
        await tx.estimateItem.createMany({
          data: items.map((item: any) => ({
            estimateId: est.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          }))
        });
      }

      return est;
    });

    return NextResponse.json({ success: true, estimate: updatedEstimate });
  } catch (error) {
    console.error("Update Estimate Error:", error);
    return NextResponse.json(
      { error: "Failed to update estimate" },
      { status: 500 }
    );
  }
}
