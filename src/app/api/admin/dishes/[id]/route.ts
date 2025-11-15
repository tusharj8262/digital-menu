import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PATCH — Update Dish
export async function PATCH(req: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const {
      name,
      description,
      price,
      spiceLevel,
      imageUrl,
      categoryId,
    } = body;

    const currentDish = await prisma.dish.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!currentDish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        description: description ?? "",
        price: price != null ? Number(price) : undefined,
        spiceLevel: spiceLevel ?? "",
        imageUrl: imageUrl ?? "",
        categories: categoryId
          ? {
              // replace existing categories with the provided one
              set: [],
              connect: { id: categoryId },
            }
          : undefined,
      },
      include: {
        categories: true,
        restaurants: true,
      },
    });

    return NextResponse.json(dish);
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json({ error: "Failed to update dish" }, { status: 500 });
  }
}

// ✅ DELETE — Delete Dish
export async function DELETE(req: Request, context: any) {
  try {
    const { id } = context.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 });
  }
}
