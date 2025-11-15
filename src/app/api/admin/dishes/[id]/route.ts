import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH update dish
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const body = await request.json();
    const {
      name,
      description,
      price,
      spiceLevel,
      imageUrl,
      categoryId
    } = body;

    // Fetch current dish
    const currentDish = await prisma.dish.findUnique({
      where: { id },
      include: { categories: true }
    });

    if (!currentDish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    // Update dish
    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        description: description || '',
        price: Number(price),
        spiceLevel: spiceLevel || '',
        imageUrl: imageUrl || '',
        categories: {
          set: [],            // remove old categories
          connect: { id: categoryId } // add new category
        }
      },
      include: {
        categories: true,
        restaurants: true
      }
    });

    return NextResponse.json(dish);
  } catch (error) {
    console.error('Error updating dish:', error);
    return NextResponse.json(
      { error: 'Failed to update dish' },
      { status: 500 }
    );
  }
}

// DELETE dish
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const dish = await prisma.dish.findUnique({
      where: { id }
    });

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    await prisma.dish.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dish:', error);
    return NextResponse.json(
      { error: 'Failed to delete dish' },
      { status: 500 }
    );
  }
}
