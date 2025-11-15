import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";

export const customerMenuRouter = createTRPCRouter({

  getMenu: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ input }) => {

      const restaurant = await db.restaurant.findUnique({
        where: { id: input.restaurantId },
      });

      const categories = await db.category.findMany({
        where: { restaurantId: input.restaurantId },
        include: {
          dishes: true,
        },
        orderBy: { name: "asc" }
      });

      return { restaurant, categories };
    }),
});
