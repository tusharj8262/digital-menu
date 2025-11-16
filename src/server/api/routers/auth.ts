import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";
import crypto from "crypto";

export const authRouter = createTRPCRouter({
  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
      const expiry = new Date(Date.now() + 5 * 60 * 1000);

      await db.user.upsert({
        where: { email: input.email },
        update: { otpHash, otpExpiry: expiry },
        create: {
          email: input.email,
          name: "",
          country: "",
          otpHash,
          otpExpiry: expiry,
        },
      });

       //console.log("OTP:", otp);

      return { success: true };
    }),

  verifyOtp: publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      otp: z.string(),
      name: z.string().optional(),
      country: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user)
      return { success: false, message: "User not found" };

    const hashed = crypto.createHash("sha256").update(input.otp).digest("hex");

    if (user.otpHash !== hashed)
      return { success: false, message: "Invalid OTP" };

    if (user.otpExpiry! < new Date())
      return { success: false, message: "OTP expired" };

    // 🔥 CASE 1 — user exists already (don't ask name/country again)
    if (user.name && user.country) {
      await db.user.update({
        where: { email: input.email },
        data: {
          isVerified: true,
          otpHash: null,
          otpExpiry: null,
        },
      });

      return {
        success: true,
        existingUser: true,   // 🔥 Important Flag
        user,
      };
    }

    // 🔥 CASE 2 — NEW USER → requires name + country
    if (!input.name || !input.country) {
      return {
        success: false,
        needProfile: true,  // 🔥 Flag to ask name+country
        message: "Profile incomplete",
      };
    }

    // Complete the new user profile
    const updatedUser = await db.user.update({
      where: { email: input.email },
      data: {
        name: input.name,
        country: input.country,
        isVerified: true,
        otpHash: null,
        otpExpiry: null,
      },
    });

    return {
      success: true,
      existingUser: false,
      user: updatedUser,
    };
  }),

});
