// src/server/api/routers/order.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const orderRouter = createTRPCRouter({
  // Create order (called from customer side)
  create: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        tableNumber: z.string().min(1),
        items: z.array(
          z.object({
            dishId: z.string(),
            name: z.string(),
            qty: z.number().int().min(1),
            price: z.number().int().min(0),
          })
        ),
        restaurantId: z.string(),
        userId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // calculate total
      const total = input.items.reduce((acc, it) => acc + it.price * it.qty, 0);

      const created = await db.order.create({
        data: {
          customerName: input.customerName,
          tableNumber: input.tableNumber,
          items: input.items as any,
          restaurantId: input.restaurantId,
          userId: input.userId ?? null,
          total,
          status: "Pending",
        },
      });

      return { success: true, order: created };
    }),

  // Admin: get all orders for restaurants owned by ownerId
  getAllByOwner: publicProcedure
    .input(z.object({ ownerId: z.string() }))
    .query(async ({ input }) => {
      const orders = await db.order.findMany({
        where: {
          restaurant: {
            ownerId: input.ownerId,
          },
        },
        include: {
          restaurant: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return orders;
    }),

  // Admin: get orders for a single restaurant
  getByRestaurant: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ input }) => {
      const orders = await db.order.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: { createdAt: "desc" },
      });
      return orders;
    }),

  // Update status (Pending / Served / Completed)
  updateStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum(["Pending", "Served", "Completed"]) }))
    .mutation(async ({ input }) => {
      const order = await db.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return order;
    }),

  // Admin can delete if needed
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.order.delete({ where: { id: input.id } });
    return { success: true };
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const order = await db.order.findUnique({
      where: { id: input.id },
      include: { restaurant: true },
    });
    return order;
  }),
});
