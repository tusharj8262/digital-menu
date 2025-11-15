import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";

export const categoryRouter = createTRPCRouter({
  // GET ALL CATEGORIES BELONGING TO THE OWNER
  getAll: publicProcedure
    .input(
      z.object({
        ownerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await db.category.findMany({
        where: {
          restaurant: {
            ownerId: input.ownerId,
          },
        },
        include: {
          restaurant: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  // ADD CATEGORY
  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        restaurantId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.category.create({
        data: {
          name: input.name,
          restaurantId: input.restaurantId,
        },
      });
    }),

  // DELETE CATEGORY
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.category.delete({
        where: { id: input.id },
      });
    }),

  // UPDATE CATEGORY
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.category.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
    }),
});
