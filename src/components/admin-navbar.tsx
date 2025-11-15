"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminNavbar() {
  const pathname = usePathname();

  const active = (path: string) =>
    pathname === path
      ? "text-blue-600 font-bold underline"
      : "text-gray-700 hover:text-black";

  const logout = () => {
    localStorage.removeItem("adminEmail");
    window.location.href = "/admin/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        
        <Link href="/admin/dashboard" className="text-xl font-bold">
          Digital Menu Admin
        </Link>

        <div className="hidden md:flex gap-6 text-sm">
          <Link href="/admin/dashboard" className={active("/admin/dashboard")}>
            Dashboard
          </Link>
          <Link href="/admin/restaurants" className={active("/admin/restaurants")}>
            Restaurants
          </Link>
          <Link href="/admin/categories" className={active("/admin/categories")}>
            Categories
          </Link>
          <Link href="/admin/dishes" className={active("/admin/dishes")}>
            Dishes
          </Link>
          <Link href="/admin/orders" className={active("/admin/orders")}>
            Orders
          </Link>
        </div>

        <Button variant="destructive" onClick={logout} className="hidden md:block">
          Logout
        </Button>

      </div>
    </nav>
  );
}
