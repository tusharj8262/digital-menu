import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";

// Generate slug
const makeSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") +
  "-" +
  Date.now().toString().slice(-4);

export const restaurantRouter = createTRPCRouter({
  // GET ALL RESTAURANTS
  getAll: publicProcedure
    .input(z.object({ ownerId: z.string() }))
    .query(async ({ input }) => {
      return await db.restaurant.findMany({
        where: { ownerId: input.ownerId },
        orderBy: { createdAt: "desc" },
      });
    }),

  // ADD RESTAURANT
  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        location: z.string().min(2, "Location must be at least 2 characters"),
        ownerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.restaurant.create({
        data: {
          name: input.name,
          location: input.location,
          slug: makeSlug(input.name),
          ownerId: input.ownerId,
        },
      });
    }),

  // UPDATE RESTAURANT
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2),
        location: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      return await db.restaurant.update({
        where: { id: input.id },
        data: {
          name: input.name,
          location: input.location,
        },
      });
    }),

  // DELETE RESTAURANT
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.restaurant.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
