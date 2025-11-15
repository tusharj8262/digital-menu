"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  dishId?: string;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  tableNumber: string;
  createdAt: string;
}

export default function StatusPage({ params }: any) {
  const restaurantId = params.id;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");
    if (!orderId) {
      router.push(`/customer/${restaurantId}/start`);
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        // Try to fetch from API first
        const res = await fetch(`/api/order/${orderId}`);
        if (res.ok) {
          const apiOrder = await res.json();
          setOrder(apiOrder);
        } else {
          // Fallback to localStorage data
          const lastOrderItems = localStorage.getItem("lastOrderItems");
          const lastOrderTotal = localStorage.getItem("lastOrderTotal");
          
          if (lastOrderItems && lastOrderTotal) {
            setOrder({
              id: orderId,
              status: "preparing",
              items: JSON.parse(lastOrderItems).map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.qty
              })),
              total: parseFloat(lastOrderTotal),
              customerName: localStorage.getItem("custName") || "",
              tableNumber: localStorage.getItem("custTable") || "",
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        // Fallback to localStorage
        const lastOrderItems = localStorage.getItem("lastOrderItems");
        const lastOrderTotal = localStorage.getItem("lastOrderTotal");
        
        if (lastOrderItems && lastOrderTotal) {
          setOrder({
            id: orderId,
            status: "preparing",
            items: JSON.parse(lastOrderItems).map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.qty
            })),
            total: parseFloat(lastOrderTotal),
            customerName: localStorage.getItem("custName") || "",
            tableNumber: localStorage.getItem("custTable") || "",
            createdAt: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [restaurantId, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "preparing": return "text-blue-600";
      case "ready": return "text-green-600";
      case "completed": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Order Received";
      case "preparing": return "Being Prepared";
      case "ready": return "Ready for Pickup";
      case "completed": return "Completed";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Order Status</h1>
          <p className="text-gray-600 mb-6">We'll update you when your order is ready</p>

          {order && (
            <>
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Table Number</p>
                  <p className="font-semibold">{order.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{order.id.slice(0, 8)}...</p>
                </div>
                <div className="text-right md:text-left">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-bold text-lg ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </p>
                </div>
              </div>

              {/* Order Items - UPDATED FOR NEW DATA STRUCTURE */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Items</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-pink-600">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-pink-600">₹{order.total}</span>
                </div>
              </div>
            </>
          )}

          {!order && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Order not found</p>
              <button
                onClick={() => router.push(`/customer/${restaurantId}/menu`)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold mt-4"
              >
                Start New Order
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push(`/customer/${restaurantId}/menu`)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}