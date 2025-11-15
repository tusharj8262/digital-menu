import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =========================
// UPDATE ORDER (PATCH)
// =========================
export async function PATCH(req: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const {
      customerName,
      tableNumber,
      items,
      total,
      status
    } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        tableNumber,
        items,
        total,
        status
      }
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE ORDER
// =========================
export async function DELETE(req: Request, context: any) {
  try {
    const { id } = context.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
