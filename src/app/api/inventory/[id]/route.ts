import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    // @ts-ignore
    const { NextResponse } = require("next/server");
    // @ts-ignore
    const { default: prisma } = require("@/lib/prisma");

    await prisma.product.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    // @ts-ignore
    const { NextResponse } = require("next/server");
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

