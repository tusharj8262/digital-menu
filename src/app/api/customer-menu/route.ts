// src/app/api/customer-menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    console.log('🔍 Fetching menu from database for restaurant:', restaurantId);

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Get dishes directly without checking restaurant first
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Found ${dishes.length} dishes`);

    // Return dishes (empty array if no dishes)
    return NextResponse.json(dishes);

  } catch (error: any) {
    console.error('❌ Error fetching menu from database:', error);
    
    // Return empty array instead of error for customer side
    return NextResponse.json([]);
  }
}