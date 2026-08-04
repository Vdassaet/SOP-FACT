import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        estimate: {
          include: {
            items: true
          }
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Fetch Project Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
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
    
    // We update fields that might be changed in Project Detail
    const {
      status, assignedTeam, startDate, estimatedEnd, notes
    } = body;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status,
        assignedTeam,
        notes,
        startDate: startDate ? new Date(startDate) : null,
        estimatedEnd: estimatedEnd ? new Date(estimatedEnd) : null,
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Update Project Error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
