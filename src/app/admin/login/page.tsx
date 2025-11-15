
"use client";


import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  // --- API CALLS ---
  const sendOtp = api.auth.sendOtp.useMutation({
    onSuccess: () => {
      setStep("otp");
      alert("OTP sent on console! (dev mode)");
    },
  });

  const verifyOtp = api.auth.verifyOtp.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        alert("Login Successful! 🎉");
        router.push("/admin/dashboard"); // ✅ redirect after login
      } else {
        alert(res.message);
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4 text-center">
          Admin Login
        </h1>

        {/* STEP 1: Email Input */}
        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full p-2 border mb-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="w-full bg-blue-600 text-white p-2 rounded"
              onClick={() => sendOtp.mutate({ email })}
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2: OTP + Name + Country */}
        {step === "otp" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 border mb-3 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter Name"
              className="w-full p-2 border mb-3 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter Country"
              className="w-full p-2 border mb-3 rounded"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            <button
              className="w-full bg-green-600 text-white p-2 rounded"
              onClick={() =>
                verifyOtp.mutate({
                  email,
                  otp,
                  name,
                  country,
                })
              }
            >
              Verify & Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
