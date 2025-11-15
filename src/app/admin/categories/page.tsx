"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import AdminNavbar from "@/components/admin-navbar";

export default function CategoriesPage() {
  const OWNER_ID = "admin-id"; // replace later with session user

  const ctx = api.useContext();

  // Restaurants (needed for dropdown)
  const restaurants = api.restaurant.getAll.useQuery({ ownerId: OWNER_ID });

  // Categories
  const categories = api.category.getAll.useQuery({ ownerId: OWNER_ID });

  // Add state
  const [name, setName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");

  // ADD CATEGORY
  const addCategory = api.category.add.useMutation({
    onSuccess: async () => {
      await ctx.category.getAll.invalidate();
      setName("");
      setRestaurantId("");
      alert("Category added successfully!");
    },
  });

  // DELETE CATEGORY
  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      await ctx.category.getAll.invalidate();
    },
  });

  // UPDATE CATEGORY
  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await ctx.category.getAll.invalidate();
      setEditMode(false);
      alert("Category updated!");
    },
  });

  return (
    <div>
      <AdminNavbar />

      <div className="pt-24 p-6 max-w-xl mx-auto bg-white shadow rounded">

        <h1 className="text-3xl font-bold text-center mb-6">Manage Categories</h1>

        <h2 className="text-xl font-semibold mb-3">Add New Category</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
        >
          <option value="">Select Restaurant</option>
          {restaurants.data?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <button
          className="bg-black text-white w-full py-2 rounded"
          onClick={() => {
            if (!restaurantId) return alert("Select a restaurant!");
            addCategory.mutate({ name, restaurantId });
          }}
        >
          Add Category
        </button>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-3">All Categories</h2>

        {categories.data?.map((c) => (
          <div key={c.id} className="flex justify-between border p-3 mb-3 rounded">
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-gray-600 text-sm">
                {c.restaurant.name} ({c.restaurant.location})
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="text-blue-600"
                onClick={() => {
                  setEditMode(true);
                  setEditId(c.id);
                  setEditName(c.name);
                }}
              >
                Edit
              </button>

              <button
                className="text-red-600"
                onClick={() => deleteCategory.mutate({ id: c.id })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* EDIT MODAL */}
        {editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-80 shadow">
              <h2 className="text-xl font-semibold mb-4">Edit Category</h2>

              <input
                className="border p-2 w-full mb-3"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => updateCategory.mutate({ id: editId, name: editName })}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
