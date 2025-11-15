"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"email" | "otp" | "details">("email");

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const sendOtp = api.auth.sendOtp.useMutation({
    onSuccess: () => setStage("otp"),
  });

  const verifyOtp = api.auth.verifyOtp.useMutation({
    onSuccess: (res) => {
      // 🔥 CASE 1 — OLD USER (Direct Dashboard)
      if (res.existingUser) {
        window.location.href = "/admin/dashboard";
        return;
      }

      // 🔥 CASE 2 — NEW USER → need profile
      if (res.needProfile) {
        setStage("details");
        return;
      }

      // 🔥 CASE 3 — NEW USER profile completed → Dashboard
      if (res.success) {
        window.location.href = "/admin/dashboard";
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {stage === "email" && "Login"}
            {stage === "otp" && "Enter OTP"}
            {stage === "details" && "Complete Profile"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* EMAIL STAGE */}
          {stage === "email" && (
            <>
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="w-full" onClick={() => sendOtp.mutate({ email })}>
                Send OTP
              </Button>
            </>
          )}

          {/* OTP STAGE */}
          {stage === "otp" && (
            <>
              <Input
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() =>
                  verifyOtp.mutate({
                    email,
                    otp,
                    name: "", // Blank on purpose
                    country: "", // Blank on purpose
                  })
                }
              >
                Verify OTP
              </Button>
            </>
          )}

          {/* DETAILS STAGE — Only for NEW USERS */}
          {stage === "details" && (
            <>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={() =>
                  verifyOtp.mutate({
                    email,
                    otp,
                    name,
                    country,
                  })
                }
              >
                Save & Continue
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
