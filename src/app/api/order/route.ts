import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { customerName, tableNumber, restaurantId, items } = await request.json();

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.qty);
    }, 0);

    // Save to database with OrderItem relation
    const order = await prisma.order.create({
      data: {
        customerName,
        tableNumber,
        restaurantId,
        total: totalAmount,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.qty,
            dishId: item.id,
          }))
        }
      },
      include: {
        items: true,
        restaurant: true
      }
    });

    return NextResponse.json({ 
      id: order.id,
      total: order.total,
      status: order.status
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}