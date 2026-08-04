import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Auto-generate estimate number: EST-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const estimateNumber = `EST-${dateStr}-${randomStr}`;

    const estimate = await prisma.estimate.create({
      data: {
        number: estimateNumber,
        customerId: data.customerId,
        description: data.notes || null,
        
        // CRM / Project Extensions
        propertyType: data.propertyType || null,
        projectType: data.projectType || null,
        priority: data.priority || null,
        salespersonId: data.salespersonId || null,
        estimatedInstallDate: data.estimatedInstallDate ? new Date(data.estimatedInstallDate) : null,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        installAddress: data.installAddress || null,

        // Measurements
        linearFeet: data.linearFeet ? parseFloat(data.linearFeet) : null,
        height: data.height ? parseFloat(data.height) : null,
        gateCount: data.gateCount ? parseInt(data.gateCount) : null,
        gateWidth: data.gateWidth ? parseFloat(data.gateWidth) : null,
        linePosts: data.linePosts ? parseInt(data.linePosts) : null,
        cornerPosts: data.cornerPosts ? parseInt(data.cornerPosts) : null,
        terminalPosts: data.terminalPosts ? parseInt(data.terminalPosts) : null,

        // Labor & Expenses
        laborCrewSize: data.laborCrewSize ? parseInt(data.laborCrewSize) : null,
        laborEstimatedHours: data.laborEstimatedHours ? parseFloat(data.laborEstimatedHours) : null,
        laborHourlyRate: data.laborHourlyRate ? parseFloat(data.laborHourlyRate) : null,
        machineryCost: data.machineryCost ? parseFloat(data.machineryCost) : null,
        permitCost: data.permitCost ? parseFloat(data.permitCost) : null,
        transportCost: data.transportCost ? parseFloat(data.transportCost) : null,
        disposalCost: data.disposalCost ? parseFloat(data.disposalCost) : null,
        overheadPercent: data.overheadPercent ? parseFloat(data.overheadPercent) : null,

        // Totals & Profitability
        margin: data.margin ? parseFloat(data.margin) : null,
        subtotal: data.subtotal || 0.0,
        tax: data.tax || 0.0,
        discount: data.discount || 0.0,
        total: data.totalAmount || 0.0,
        
        status: data.status || "DRAFT",

        items: {
          create: data.items && data.items.length > 0 ? data.items.map((item: any) => ({
            name: item.name || item.description || "Item", // Fixed 'name' missing error
            description: item.description,
            quantity: item.quantity ? parseInt(item.quantity) : 1,
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : 0,
            total: (item.quantity || 1) * (item.unitPrice || 0)
          })) : []
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(estimate, { status: 201 });
  } catch (error: any) {
    console.error("Error creating estimate", error);
    return NextResponse.json({ error: "Error creating estimate", details: error?.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const whereClause = customerId ? { customerId } : {};

    const estimates = await prisma.estimate.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(estimates);
  } catch (error: any) {
    console.error("Error fetching estimates", error);
    return NextResponse.json({ error: "Error fetching estimates", details: error?.message }, { status: 500 });
  }
}
