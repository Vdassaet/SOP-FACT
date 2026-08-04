import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        supplier: data.supplier,
        cost: parseFloat(data.cost),
        salePrice: parseFloat(data.salePrice),
        stock: parseInt(data.stock),
        minLevel: parseInt(data.minLevel),
      }
    });

    // Registrar el movimiento inicial
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: product.stock,
        notes: "Inventario Inicial"
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
