import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the estimate
    const estimate = await prisma.estimate.findUnique({
      where: { id },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    if (estimate.status === "PROJECT" || estimate.status === "APPROVED") {
      return NextResponse.json(
        { error: "Estimate is already converted to a project" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure both operations succeed
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update estimate status
      const updatedEstimate = await tx.estimate.update({
        where: { id },
        data: { status: "PROJECT" },
      });

      // 2. Create the Project
      const newProject = await tx.project.create({
        data: {
          customerId: estimate.customerId,
          estimateId: estimate.id,
          address: estimate.installAddress || estimate.projectAddress || "TBD",
          jobType: estimate.projectType || "New Installation",
          status: "NEW_LEAD",
          description: `Converted from Estimate ${estimate.number}. ${estimate.description || ""}`,
        },
      });

      return { updatedEstimate, newProject };
    });

    return NextResponse.json({ success: true, project: result.newProject });
  } catch (error) {
    console.error("Convert Estimate Error:", error);
    return NextResponse.json(
      { error: "Failed to convert estimate to project" },
      { status: 500 }
    );
  }
}
