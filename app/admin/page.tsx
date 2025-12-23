"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ===================== TYPES ===================== */
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

/* ===================== DEFAULT STATE ===================== */
const DEFAULT_STATS: Stats = {
  totalProducts: 0,
  lowStock: 0,
  totalUsers: 0,

  todayRevenue: 0,
  todayExpenses: 0,
  todayCOGS: 0,
  todayStockPurchases: 0,
  todayProfit: 0,

  totalRevenue: 0,
  totalExpenses: 0,
  totalCOGS: 0,
  totalStockPurchases: 0,
  totalProfit: 0,

  balance: 0,
  totalCapital: 0,

  totalAssets: 0,
  totalAssetValue: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ===================== FORMATTER ===================== */
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  const formatCurrency = (value?: number | null) =>
    formatter.format(value ?? 0);

  /* ===================== FETCH STATS ===================== */
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load stats");

      const data = await res.json();
      setStats({ ...DEFAULT_STATS, ...data });
      setError(false);
    } catch {
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

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <h1 className="text-3xl font-bold mb-6">Loading Dashboard...</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  /* ===================== ERROR ===================== */
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Could not load dashboard data. Please refresh the page.
        </div>
      </div>
    );
  }

  /* ===================== UI ===================== */
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ===================== CAPITAL ===================== */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Capital</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Net Capital" value={formatCurrency(stats.totalCapital)} color="bg-purple-500">
            <Link href="/capital" className="underline text-sm">View Capital</Link>
          </Card>

          <Card title="Net Cash" value={formatCurrency(stats.balance)} color="bg-teal-600" />
        </div>
      </section>

      {/* ===================== FINANCE ===================== */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Finance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Today Revenue" value={formatCurrency(stats.todayRevenue)} color="bg-yellow-500" />
          <Card title="Today Expenses" value={formatCurrency(stats.todayExpenses)} color="bg-red-500" />
          <Card title="Today Profit" value={formatCurrency(stats.todayProfit)} color="bg-pink-500" />
          <Card title="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="bg-indigo-500" />
          <Card title="Total Expenses" value={formatCurrency(stats.totalExpenses)} color="bg-orange-500" />
          <Card title="Total Profit" value={formatCurrency(stats.totalProfit)} color="bg-teal-500" />
        </div>
      </section>

      {/* ===================== INVENTORY & ASSETS ===================== */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Inventory & Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Products" value={stats.totalProducts} color="bg-blue-500" />
          <Card title="Low Stock Items" value={stats.lowStock} color="bg-red-600" />
          <Card
            title="Total Assets"
            value={stats.totalAssets}
            color="bg-gray-700"
            sub={`Value: ${formatCurrency(stats.totalAssetValue)}`}
          />
          <Card
            title="Stock Purchases"
            value={formatCurrency(stats.totalStockPurchases)}
            color="bg-indigo-400"
          />
        </div>
      </section>

      {/* ===================== MANAGEMENT ===================== */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NavCard href="/store" title="Inventory Management" desc="Manage products" />
          <NavCard href="/inventory-transaction" title="Inventory Transactions" desc="Track stock movement" />
          <NavCard href="/capital" title="Capital Management" desc="Capital injections" />
          <NavCard href="/asset-management" title="Asset Management" desc="Business assets" />
          <NavCard href="/users" title="User Management" desc="Staff accounts" />
          <NavCard href="/purchase-orders" title="Purchase Orders" desc="Record stock purchases" />
          <NavCard href="/expenses" title="Expenses" desc="Withdrawals & expenses" />
          <NavCard href="/reports" title="Reports" desc="Sales reports" />
          <NavCard href="/sell" title="POS" desc="Start selling" />
        </div>
      </section>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function Card({
  title,
  value,
  color,
  sub,
  children,
}: {
  title: string;
  value: React.ReactNode;
  color: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${color} text-white p-4 rounded shadow`}>
      <h3 className="text-lg">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-sm mt-1">{sub}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="p-6 bg-white shadow rounded border hover:bg-gray-50"
    >
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}
