"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import AdminNavbar from "@/components/admin-navbar";
import Link from "next/link";   // <-- ADD THIS

export default function RestaurantsPage() {
  const OWNER_ID = "admin-id"; 
  const ctx = api.useContext();

  const restaurants = api.restaurant.getAll.useQuery({ ownerId: OWNER_ID });

  const addRestaurant = api.restaurant.add.useMutation({
    onSuccess: async () => {
      await ctx.restaurant.getAll.invalidate();
      setName("");
      setLocation("");
      alert("Restaurant added successfully");
    },
  });

  const deleteRestaurant = api.restaurant.delete.useMutation({
    onSuccess: async () => {
      await ctx.restaurant.getAll.invalidate();
    },
  });

  const updateRestaurant = api.restaurant.update.useMutation({
    onSuccess: async () => {
      await ctx.restaurant.getAll.invalidate();
      setEditMode(false);
      setEditId("");
      setEditName("");
      setEditLocation("");
      alert("Restaurant updated");
    },
  });

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const openEdit = (r: any) => {
    setEditId(r.id);
    setEditName(r.name);
    setEditLocation(r.location);
    setEditMode(true);
  };

  const handleAdd = () => {
    addRestaurant.mutate({ name, location, ownerId: OWNER_ID });
  };

  const handleUpdate = () => {
    updateRestaurant.mutate({
      id: editId,
      name: editName,
      location: editLocation,
    });
  };

  return (
    <div>
      <AdminNavbar />

      <div className="pt-20 p-8 min-h-screen bg-gray-100">
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">

          <h1 className="text-3xl font-bold mb-6 text-center">Manage Restaurants</h1>

          <h2 className="text-xl font-semibold mb-4">Add Restaurant</h2>

          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Restaurant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button
            className="bg-black text-white w-full py-2 rounded"
            onClick={handleAdd}
          >
            Add Restaurant
          </button>

          <hr className="my-6" />

          <h2 className="text-xl font-semibold mb-4">Your Restaurants</h2>

          {restaurants.data?.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center border p-3 rounded mb-3"
            >
              <div>
                <p className="font-bold">{r.name}</p>
                <p className="text-gray-600">{r.location}</p>
              </div>

              <div className="flex gap-4">
                {/* ✅ QR Button */}
                <Link
                  href={`/admin/restaurants/${r.id}/qrcode`}
                  className="text-purple-600 font-semibold"
                >
                  QR
                </Link>

                <button className="text-blue-600" onClick={() => openEdit(r)}>
                  Edit
                </button>

                <button
                  className="text-red-600"
                  onClick={() => deleteRestaurant.mutate({ id: r.id })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {editMode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Restaurant</h2>

                <input
                  className="w-full border p-2 rounded mb-3"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <input
                  className="w-full border p-2 rounded mb-3"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
