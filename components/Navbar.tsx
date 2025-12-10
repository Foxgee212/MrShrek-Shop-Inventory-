"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ role }: { role: "admin" | "staff" }) {
  const router = useRouter();

  const logout = () => {
    document.cookie = "token=; max-age=0; path=/";
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-xl">
        MrShrek Shop
      </Link>

      <div className="flex space-x-4">
        <Link href="/sell">Sale</Link>

        {role === "staff" && (
          <Link href="/inventory">Inventory</Link>
        )}

        {role === "admin" && (
          <Link href="/admin">Admin</Link>
        )}

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
