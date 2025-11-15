import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH update dish
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      spiceLevel,
      imageUrl,
      categoryId
    } = body;

    // First, disconnect all current categories
    const currentDish = await prisma.dish.findUnique({
      where: { id: params.id },
      include: { categories: true }
    });

    if (!currentDish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    // Update dish with new category
    const dish = await prisma.dish.update({
      where: { id: params.id },
      data: {
        name,
        description: description || '',
        price: Number(price),
        spiceLevel: spiceLevel || '',
        imageUrl: imageUrl || '',
        categories: {
          set: [], // Clear existing categories
          connect: { id: categoryId } // Connect new category
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if dish exists
    const dish = await prisma.dish.findUnique({
      where: { id: params.id }
    });

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    // Delete the dish
    await prisma.dish.delete({
      where: { id: params.id }
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