// src/app/admin/dishes/page.tsx
"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/admin-navbar";

interface Restaurant {
  id: string;
  name: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
  restaurantId: string;
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  spiceLevel?: string;
  imageUrl?: string;
  categories: Category[];
  restaurants: Restaurant[];
}

export default function DishesPage() {
  // ----- STATE VARIABLES -----
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [restaurantId, setRestaurantId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [spiceLevel, setSpiceLevel] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  // ----- FETCH DATA -----
  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchCategories = async (restId: string) => {
    if (!restId) return;
    try {
      const res = await fetch(`/api/admin/categories?restaurantId=${restId}`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDishes = async (restId: string) => {
    if (!restId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dishes?restaurantId=${restId}`);
      const data = await res.json();
      setDishes(data);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchCategories(restaurantId);
      fetchDishes(restaurantId);
      setCategoryId(""); // Reset category when restaurant changes
    } else {
      setCategories([]);
      setDishes([]);
    }
  }, [restaurantId]);

  // ----- IMAGE UPLOAD -----
  const uploadImage = async () => {
    if (!imageFile) {
      alert("Please choose an image!");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageUrl(data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
      return null;
    }
  };

  // ----- RESET FORM -----
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setSpiceLevel("");
    setCategoryId("");
    setImageFile(null);
    setImageUrl("");
    setEditMode(false);
    setEditId("");
  };

  // ----- ADD DISH -----
  const handleAddDish = async () => {
    if (!restaurantId || !categoryId) {
      alert("Please select both restaurant and category!");
      return;
    }
    if (!name || !price) {
      alert("Please fill in all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Upload image if new file is selected
      if (imageFile && !imageUrl) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl) return;
      }

      const res = await fetch("/api/admin/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          spiceLevel,
          imageUrl: finalImageUrl,
          restaurantId,
          categoryId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add dish");

      const newDish = await res.json();
      setDishes(prev => [newDish, ...prev]);
      resetForm();
      alert("Dish added successfully!");
    } catch (error) {
      console.error("Error adding dish:", error);
      alert("Failed to add dish");
    } finally {
      setSubmitting(false);
    }
  };

  // ----- UPDATE DISH -----
  const handleUpdateDish = async () => {
    if (!name || !price) {
      alert("Please fill in all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Upload image if new file is selected
      if (imageFile && !imageUrl) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl) return;
      }

      const res = await fetch(`/api/admin/dishes/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          spiceLevel,
          imageUrl: finalImageUrl,
          categoryId,
        }),
      });

      if (!res.ok) throw new Error("Failed to update dish");

      const updatedDish = await res.json();
      setDishes(prev => prev.map(d => d.id === editId ? updatedDish : d));
      resetForm();
      alert("Dish updated successfully!");
    } catch (error) {
      console.error("Error updating dish:", error);
      alert("Failed to update dish");
    } finally {
      setSubmitting(false);
    }
  };

  // ----- DELETE DISH -----
  const handleDeleteDish = async (dishId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
      const res = await fetch(`/api/admin/dishes/${dishId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete dish");

      setDishes(prev => prev.filter(d => d.id !== dishId));
      alert("Dish deleted successfully!");
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Failed to delete dish");
    }
  };

  // ----- EDIT DISH -----
  const startEdit = (dish: Dish) => {
    setEditMode(true);
    setEditId(dish.id);
    setName(dish.name);
    setDescription(dish.description || "");
    setPrice(dish.price);
    setSpiceLevel(dish.spiceLevel || "");
    setCategoryId(dish.categories[0]?.id || "");
    setImageUrl(dish.imageUrl || "");
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Dishes</h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage your restaurant's menu items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editMode ? "Edit Dish" : "Add New Dish"}
            </h2>

            {/* Restaurant & Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!restaurantId}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dish Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter dish name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter dish description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spice Level
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={spiceLevel}
                    onChange={(e) => setSpiceLevel(e.target.value)}
                  >
                    <option value="">Select Spice Level</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Very Hot">Very Hot</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Image
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  
                  {imageUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✅</span>
                      <span className="text-sm">Image uploaded successfully</span>
                    </div>
                  )}

                  {imageFile && !imageUrl && (
                    <button
                      type="button"
                      onClick={uploadImage}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors self-start"
                    >
                      Upload Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {!editMode ? (
                <button
                  onClick={handleAddDish}
                  disabled={submitting || !restaurantId || !categoryId || !name || !price}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add Dish"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleUpdateDish}
                    disabled={submitting || !name || !price}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Updating..." : "Update Dish"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Dish List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Dishes</h2>
              {restaurantId && (
                <span className="text-sm text-gray-500">
                  {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
                </span>
              )}
            </div>

            {!restaurantId ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 text-lg">Select a restaurant to view dishes</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading dishes...</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No dishes found</p>
                <p className="text-gray-400 text-sm mt-2">Add your first dish using the form</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {dish.imageUrl && (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                              {dish.spiceLevel && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  🌶️ {dish.spiceLevel}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {dish.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-bold text-green-600">₹{dish.price}</span>
                              <span className="text-gray-500">
                                Category: {dish.categories[0]?.name || "Uncategorized"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(dish)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}