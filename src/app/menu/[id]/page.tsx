"use client";

import { useRef, useState } from "react";
import { api } from "@/trpc/react";

export default function CustomerMenu({ params }: any) {
  const restaurantId = params.id;

  const { data: restaurant } = api.restaurant.getById.useQuery({ id: restaurantId });
  const { data: categories } = api.category.getAll.useQuery({ ownerId: "admin-id" });
  const { data: dishes } = api.dish.getAll.useQuery({ restaurantId });

  const [openMenu, setOpenMenu] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToCat = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpenMenu(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 bg-white shadow sticky top-0 z-50">
        <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
        <p className="text-gray-600">{restaurant?.location}</p>
      </div>

      {/* Floating menu button */}
      <button
        onClick={() => setOpenMenu(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-pink-600 text-white px-6 py-2 rounded-full"
      >
        ☰ Menu
      </button>

      {/* Category Sections */}
      <div className="p-4">
        {categories
          ?.filter((c) => c.restaurantId === restaurantId)
          .map((cat) => (
            <div key={cat.id} ref={(el) => (sectionRefs.current[cat.id] = el)}>
              <h2 className="text-xl font-bold my-4">{cat.name}</h2>

              <div className="space-y-3">
                {dishes
                  ?.filter((d) => d.categories.some((c: any) => c.id === cat.id))
                  .map((dish) => (
                    <div key={dish.id} className="bg-white p-3 shadow rounded flex gap-3">
                      <img
                        src={dish.imageUrl}
                        className="w-24 h-24 object-cover rounded"
                        alt="dish"
                      />
                      <div>
                        <p className="font-bold">{dish.name}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {dish.description}
                        </p>
                        <p className="font-semibold mt-1">₹ {dish.price}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {/* Category Modal */}
      {openMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md p-4 rounded">
            <h2 className="text-xl font-bold text-center mb-4">Menu Categories</h2>

            {categories
              ?.filter((c) => c.restaurantId === restaurantId)
              .map((cat) => (
                <p
                  key={cat.id}
                  className="py-2 text-lg border-b cursor-pointer hover:text-pink-600"
                  onClick={() => scrollToCat(cat.id)}
                >
                  {cat.name}
                </p>
              ))}

            <button
              className="mt-4 w-full bg-gray-700 text-white py-2 rounded"
              onClick={() => setOpenMenu(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
