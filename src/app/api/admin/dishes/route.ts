import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all dishes for a restaurant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const dishes = await prisma.dish.findMany({
      where: {
        restaurants: {
          some: {
            id: restaurantId
          }
        }
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        restaurants: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dishes' },
      { status: 500 }
    );
  }
}

// POST create new dish
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      spiceLevel,
      imageUrl,
      restaurantId,
      categoryId
    } = body;

    // Validate required fields
    if (!name || !price || !restaurantId || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the dish and connect to restaurant and category
    const dish = await prisma.dish.create({
      data: {
        name,
        description: description || '',
        price: Number(price),
        spiceLevel: spiceLevel || '',
        imageUrl: imageUrl || '',
        categories: {
          connect: { id: categoryId }
        },
        restaurants: {
          connect: { id: restaurantId }
        }
      },
      include: {
        categories: true,
        restaurants: true
      }
    });

    return NextResponse.json(dish);
  } catch (error) {
    console.error('Error creating dish:', error);
    return NextResponse.json(
      { error: 'Failed to create dish' },
      { status: 500 }
    );
  }
}