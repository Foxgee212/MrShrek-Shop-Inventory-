"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalProducts: number;
  lowStock: number;
  totalUsers: number;

  todayRevenue: number;
  todayExpenses: number;
  todayCOGS: number;
  todayStockPurchases: number;
  todayProfit: number;

  totalRevenue: number;
  totalExpenses: number;
  totalCOGS: number;
  totalStockPurchases: number;
  totalProfit: number;

  balance: number;
  totalCapital: number;

  totalAssets: number;
  totalAssetValue: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (num: number) =>
    `₦${num.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <h1 className="text-3xl font-bold mb-6">Loading Dashboard...</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-red-600 bg-red-100 p-3 rounded">
          Could not load stats. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ====================== CAPITAL SECTION ====================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Capital</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-500 text-white rounded shadow">
            <h3 className="text-xl">Net Capital</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalCapital)}</p>
            <Link href="/capital" className="text-sm underline hover:text-gray-200">
              View Capital Transactions
            </Link>
          </div>

          <div className="p-4 bg-teal-600 text-white rounded shadow">
            <h3 className="text-xl">Net Cash</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.balance)}</p>
          </div>
        </div>
      </section>

      {/* ====================== FINANCE / EXPENSE SECTION ====================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Finance / Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-500 text-white rounded shadow">
            <h3 className="text-xl">Today Revenue</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
          </div>

          <div className="p-4 bg-red-500 text-white rounded shadow">
            <h3 className="text-xl">Today Expenses</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.todayExpenses)}</p>
          </div>

          <div className="p-4 bg-pink-500 text-white rounded shadow">
            <h3 className="text-xl">Today Profit</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.todayProfit)}</p>
          </div>

          <div className="p-4 bg-indigo-500 text-white rounded shadow">
            <h3 className="text-xl">Total Revenue</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </div>

          <div className="p-4 bg-orange-500 text-white rounded shadow">
            <h3 className="text-xl">Total Expenses</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
          </div>

          <div className="p-4 bg-teal-500 text-white rounded shadow">
            <h3 className="text-xl">Total Profit</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalProfit)}</p>
          </div>
        </div>
      </section>

      {/* ====================== INVENTORY SECTION ====================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Inventory & Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500 text-white rounded shadow">
            <h3 className="text-xl">Total Products</h3>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </div>

          <div className="p-4 bg-red-500 text-white rounded shadow">
            <h3 className="text-xl">Low Stock Items</h3>
            <p className="text-3xl font-bold">{stats.lowStock}</p>
          </div>

          <div className="p-4 bg-gray-700 text-white rounded shadow">
            <h3 className="text-xl">Total Assets</h3>
            <p className="text-3xl font-bold">{stats.totalAssets}</p>
            <p className="text-sm">Value: {formatCurrency(stats.totalAssetValue)}</p>
          </div>

          <div className="p-4 bg-indigo-400 text-white rounded shadow">
            <h3 className="text-xl">Stock Purchases</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalStockPurchases)}</p>
          </div>
        </div>
      </section>

      {/* ====================== USERS & MANAGEMENT LINKS ====================== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/store"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Inventory Management</h3>
            <p>Add, edit, and delete products.</p>
          </Link>

          <Link
            href="/inventory-transaction"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Inventory Transactions</h3>
            <p>Track stock purchases and inventory adjustments.</p>
          </Link>

          <Link
            href="/capital"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Capital Management</h3>
            <p>Record and manage business capital injections.</p>
          </Link>

          <Link
            href="/assets"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Asset Management</h3>
            <p>Track and add business assets.</p>
          </Link>

          <Link
            href="/users"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">User Management</h3>
            <p>Add or remove staff accounts (admin only).</p>
          </Link>

          <Link
            href="/purchase-orders"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Purchase Orders</h3>
            <p>Record new stock you bought.</p>
          </Link>

          <Link
            href="/expenses"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Expenses</h3>
            <p>Record withdrawals and miscellaneous expenses.</p>
          </Link>

          <Link
            href="/reports"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Reports</h3>
            <p>Daily/weekly/monthly sales breakdown.</p>
          </Link>

          <Link
            href="/sell"
            className="p-6 text-gray-800 bg-white shadow rounded border hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold">Go to POS</h3>
            <p>Start selling items now.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
