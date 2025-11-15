"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function CartPage({ params }: any) {
  const restaurantId = params.id;
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const increase = (id: string) => {
    const updated = cart.map((item) => 
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const decrease = (id: string) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, qty: item.qty - 1 } : item)
      .filter((item) => item.qty > 0);
    
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // UPDATED placeOrder FUNCTION
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const customerName = localStorage.getItem("custName");
      const tableNumber = localStorage.getItem("custTable");

      if (!customerName || !tableNumber) {
        alert("Customer information missing. Please start over.");
        router.push(`/customer/${restaurantId}/start`);
        return;
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          tableNumber,
          restaurantId,
          items: cart,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const data = await res.json();
      localStorage.setItem("orderId", data.id);
      
      // Save cart data temporarily for status page (fallback)
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      localStorage.setItem("lastOrderItems", JSON.stringify(cart));
      localStorage.setItem("lastOrderTotal", totalAmount.toString());
      
      // Clear cart after successful order
      localStorage.removeItem("cart");
      
      router.push(`/customer/${restaurantId}/status`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push(`/customer/${restaurantId}/menu`)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>

        <div className="space-y-4 mb-8">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-900">{item.name}</p>
                  <p className="text-gray-600">₹{item.price} each</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  🗑️
                </button>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-bold text-pink-600">₹{item.price * item.qty}</p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decrease(item.id)}
                    className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                  >
                    -
                  </button>
                  <span className="font-semibold w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => increase(item.id)}
                    className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-pink-600">₹{totalPrice}</span>
          </div>
        </div>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}