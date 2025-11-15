

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="bg-white p-6 rounded shadow mb-6">
        <h1 className="text-3xl font-bold text-center">
          Welcome to Admin Dashboard 🎯
        </h1>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <a
          href="/admin/restaurants"
          className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-xl font-bold">Manage Restaurants</h2>
          <p className="text-gray-600 mt-2">Add, Edit, Delete Restaurants</p>
        </a>

        <a
          href="/admin/categories"
          className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-xl font-bold">Manage Categories</h2>
          <p className="text-gray-600 mt-2">Food item categories</p>
        </a>

        <a
          href="/admin/dishes"
          className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-xl font-bold">Manage Dishes</h2>
          <p className="text-gray-600 mt-2">Add dishes & pricing</p>
        </a>

      </div>
    </div>
  );
}

