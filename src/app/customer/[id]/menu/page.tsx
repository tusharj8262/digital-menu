// src/app/customer/[id]/menu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  spiceLevel?: string;
  imageUrl?: string;
  categories: Array<{ name: string }>;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function CustomerMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [restaurantId, setRestaurantId] = useState<string>("");
  const router = useRouter();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Dish[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve async params
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setRestaurantId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch Menu Items when restaurantId is available
  useEffect(() => {
    async function fetchMenu() {
      if (!restaurantId) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching menu for restaurant:', restaurantId);
        
        const res = await fetch(`/api/customer-menu?restaurantId=${restaurantId}`);
        
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch menu: ${res.status}`);
        }

        const data = await res.json();
        console.log('Received data:', data);

        setDishes(data);

        // Group by Category
        const groups: Record<string, Dish[]> = {};
        data.forEach((dish: Dish) => {
          const cat = dish.categories[0]?.name || "Other";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(dish);
        });

        console.log('Grouped dishes:', groups);
        setGrouped(groups);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError(error instanceof Error ? error.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurantId]);

  // Add to Cart
  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.id === dish.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === dish.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { 
          id: dish.id, 
          name: dish.name, 
          price: dish.price, 
          qty: 1 
        }];
      }
    });
  };

  // Remove from cart in popup
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Update quantity in popup
  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, qty: newQty }
          : item
      )
    );
  };

  // Calculate total items and price
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const proceedToCheckout = () => {
    setCartOpen(false);
    router.push(`/customer/${restaurantId}/cart`);
  };

  // Show loading while resolving params
  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Menu</h1>
        <p className="text-gray-600">Restaurant ID: {restaurantId}</p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong> {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <span className="ml-3">Loading menu...</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && dishes.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No menu items available</p>
          <p className="text-gray-400 text-sm">
            This restaurant hasn't added any dishes yet.
          </p>
        </div>
      )}

      {/* DEBUG INFO */}
      {!loading && (
        <div className="text-sm text-gray-500 mb-4">
          Found {dishes.length} dishes in {Object.keys(grouped).length} categories
        </div>
      )}

      {/* CATEGORY SECTIONS */}
      {!loading && Object.keys(grouped).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-pink-200 pb-2">
            {category} ({grouped[category].length} items)
          </h2>

          {grouped[category].map((dish: Dish) => (
            <div
              key={dish.id}
              className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200 flex justify-between hover:shadow-md transition-shadow duration-200"
            >
              {/* TEXT CONTENT */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-lg font-semibold text-gray-900">{dish.name}</p>
                  <p className="font-bold text-gray-900">₹{dish.price}</p>
                </div>
                <p className="text-gray-600 text-sm mb-2">{dish.description}</p>

                {dish.spiceLevel && (
                  <div className="flex items-center">
                    <span className="text-xs text-red-500 font-medium">
                      🌶️ {dish.spiceLevel} Spice
                    </span>
                  </div>
                )}
              </div>

              {/* IMAGE AND BUTTON */}
              <div className="flex items-center gap-3 ml-4">
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                  onClick={() => addToCart(dish)}
                >
                  Add +
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* CART BUTTON */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full shadow-lg text-lg font-semibold z-50 transition-colors duration-200"
        >
          🛒 Cart ({totalItems}) - ₹{totalPrice}
        </button>
      )}

      {/* CART POPUP */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-2">Add some delicious items!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-600 text-sm">₹{item.price} × {item.qty}</p>
                        <p className="font-semibold text-pink-600">
                          ₹{item.price * item.qty}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="font-semibold w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CART TOTAL */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-full bg-gray-300 hover:bg-gray-400 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}