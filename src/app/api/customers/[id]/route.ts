import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        address: body.address,
      }
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    await prisma.customer.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}

