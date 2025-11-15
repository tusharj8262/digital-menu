import { createTRPCRouter } from "@/server/api/trpc";
import { dishRouter } from "@/server/api/routers/dish";
import { orderRouter } from "./routers/order";
import { authRouter } from "@/server/api/routers/auth";
import { restaurantRouter } from "@/server/api/routers/restaurant";
import { categoryRouter } from "@/server/api/routers/category";
import { customerMenuRouter } from "./routers/customerMenu";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  restaurant: restaurantRouter,
  category: categoryRouter,
  dish: dishRouter, 
  order: orderRouter,
  customerMenu: customerMenuRouter,
});

export type AppRouter = typeof appRouter;
