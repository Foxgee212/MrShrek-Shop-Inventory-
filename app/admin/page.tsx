"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalUsers: 0,
    todaySales: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    }
    loadStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        <div className="p-4 bg-blue-500 text-white rounded shadow">
          <h2 className="text-xl">Total Products</h2>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="p-4 bg-red-500 text-white rounded shadow">
          <h2 className="text-xl">Low Stock Items</h2>
          <p className="text-3xl font-bold">{stats.lowStock}</p>
        </div>

        <div className="p-4 bg-green-500 text-white rounded shadow">
          <h2 className="text-xl">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="p-4 bg-purple-500 text-white rounded shadow">
          <h2 className="text-xl">Today Sales</h2>
          <p className="text-3xl font-bold">₦{stats.todaySales}</p>
        </div>

      </div>

      {/* MANAGEMENT LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Link href="/inventory" className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50">
          <h3 className="text-xl font-bold">Inventory Management</h3>
          <p>Add, edit, and delete products.</p>
        </Link>

        <Link href="/users" className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50">
          <h3 className="text-xl font-bold">User Management</h3>
          <p>Add or remove staff accounts (admin only).</p>
        </Link>

        <Link href="/purchase-orders" className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50">
          <h3 className="text-xl font-bold">Purchase Orders</h3>
          <p>Record new stock you bought.</p>
        </Link>

        <Link href="/reports" className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50">
          <h3 className="text-xl font-bold">Reports</h3>
          <p>Daily/weekly/monthly sales breakdown.</p>
        </Link>

        <Link href="/sell" className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50">
          <h3 className="text-xl font-bold">Go to POS</h3>
          <p>Start selling items now.</p>
        </Link>

      </div>
    </div>
  );
}
