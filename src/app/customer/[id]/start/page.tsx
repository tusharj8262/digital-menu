"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartPage({ params }: any) {
  const restaurantId = params.id;
  const router = useRouter();

  const [name, setName] = useState("");
  const [table, setTable] = useState("");
  const [loading, setLoading] = useState(false);

  const startOrder = async () => {
    if (!name.trim() || !table.trim()) {
      alert("Please enter your name and table number");
      return;
    }

    setLoading(true);
    
    // Save to localStorage
    localStorage.setItem("custName", name.trim());
    localStorage.setItem("custTable", table.trim());
    localStorage.setItem("restaurantId", restaurantId);
    
    // Clear any existing cart
    localStorage.removeItem("cart");
    localStorage.removeItem("orderId");

    router.push(`/customer/${restaurantId}/menu`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome!</h1>
        <p className="text-gray-600 text-center mb-8">Please enter your details to start ordering</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Number
            </label>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter table number"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={startOrder}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-semibold mt-6 transition-colors disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Ordering"}
        </button>
      </div>
    </div>
  );
}