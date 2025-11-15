// src/app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/admin-navbar";
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  tableNumber: string;
  status: "pending" | "preparing" | "ready" | "completed";
  total: number;
  items: OrderItem[];
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "preparing": return "Preparing";
      case "ready": return "Ready";
      case "completed": return "Completed";
      default: return status;
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Count orders by status
  const pendingOrders = orders.filter(order => order.status === "pending");
  const preparingOrders = orders.filter(order => order.status === "preparing");
  const readyOrders = orders.filter(order => order.status === "ready");
  const completedOrders = orders.filter(order => order.status === "completed");

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all restaurant orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              filterStatus === 'all' ? 'border-blue-500' : 'border-white hover:border-gray-200'
            }`}
            onClick={() => setFilterStatus('all')}
          >
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-xl">📦</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              filterStatus === 'pending' ? 'border-yellow-500' : 'border-white hover:border-gray-200'
            }`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-xl">⏰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              filterStatus === 'preparing' ? 'border-blue-500' : 'border-white hover:border-gray-200'
            }`}
            onClick={() => setFilterStatus('preparing')}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">👨‍🍳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-xl font-bold text-gray-900">{preparingOrders.length}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              filterStatus === 'ready' ? 'border-green-500' : 'border-white hover:border-gray-200'
            }`}
            onClick={() => setFilterStatus('ready')}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-xl font-bold text-gray-900">{readyOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending', label: 'Pending', count: pendingOrders.length },
              { key: 'preparing', label: 'Preparing', count: preparingOrders.length },
              { key: 'ready', label: 'Ready', count: readyOrders.length },
              { key: 'completed', label: 'Completed', count: completedOrders.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filterStatus === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {filterStatus === 'all' ? 'All Orders' : getStatusText(filterStatus)} 
              <span className="text-gray-500 ml-2">({filteredOrders.length})</span>
            </h2>
            <button
              onClick={fetchOrders}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg mb-2">No orders found</p>
              <p className="text-gray-400 text-sm">
                {filterStatus === 'all' 
                  ? "Orders will appear here when customers place them" 
                  : `No ${filterStatus} orders at the moment`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Customer</p>
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Table</p>
                          <p className="font-semibold text-gray-900">#{order.tableNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Restaurant</p>
                          <p className="font-semibold text-gray-900">{order.restaurant?.name || "N/A"}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Order Items:</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-gray-500 ml-2">× {item.quantity}</span>
                              </div>
                              <span className="text-gray-600">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-900">Total Amount:</span>
                            <span className="text-green-600 text-lg">₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {order.status === "pending" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "preparing")}
                          disabled={updatingOrderId === order.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updatingOrderId === order.id ? (
                            <>⏳ Updating...</>
                          ) : (
                            <>👨‍🍳 Start Preparing</>
                          )}
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "ready")}
                          disabled={updatingOrderId === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updatingOrderId === order.id ? (
                            <>⏳ Updating...</>
                          ) : (
                            <>✅ Mark Ready</>
                          )}
                        </button>
                      )}

                      {order.status === "ready" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          disabled={updatingOrderId === order.id}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updatingOrderId === order.id ? (
                            <>⏳ Updating...</>
                          ) : (
                            <>📦 Mark Completed</>
                          )}
                        </button>
                      )}

                      {order.status === "completed" && (
                        <div className="text-center p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Order Completed</p>
                          <p className="text-xs text-gray-500 mt-1">Thank you!</p>
                        </div>
                      )}

                      {/* Status info */}
                      <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
                        {order.status === "pending" && "🕒 Waiting to start preparation"}
                        {order.status === "preparing" && "👨‍🍳 Currently being prepared"}
                        {order.status === "ready" && "✅ Ready for pickup"}
                        {order.status === "completed" && "📦 Order completed & served"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            🔄 Auto-refreshing every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}