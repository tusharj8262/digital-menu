import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const dishRouter = createTRPCRouter({

  // GET ALL DISHES OF A RESTAURANT
  getAll: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await db.dish.findMany({
        where: {
          restaurants: {
            some: {
              id: input.restaurantId,
            },
          },
        },
        include: {
          categories: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // ADD NEW DISH
  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        spiceLevel: z.string().optional(),
        price: z.number(),
        restaurantId: z.string(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.dish.create({
        data: {
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          spiceLevel: input.spiceLevel,
          price: input.price,
          restaurants: {
            connect: { id: input.restaurantId },
          },
          categories: {
            connect: { id: input.categoryId },
          },
        },
      });
    }),

  // UPDATE DISH
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        spiceLevel: z.string().optional(),
        price: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.dish.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          spiceLevel: input.spiceLevel,
          price: input.price,
        },
      });
    }),

  // DELETE DISH
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.dish.delete({
        where: { id: input.id },
      });
    }),

});
