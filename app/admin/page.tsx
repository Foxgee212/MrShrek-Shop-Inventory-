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

  totalCapital: number;
  totalCapEx: number;
  balance: number;

  totalAssets: number;
  totalAssetValue: number;
};

/* ===================== DEFAULT ===================== */
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

  totalCapital: 0,
  totalCapEx: 0,
  balance: 0,

  totalAssets: 0,
  totalAssetValue: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  const money = (v?: number) => formatter.format(v ?? 0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStats({ ...DEFAULT_STATS, ...data });
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const i = setInterval(fetchStats, 10000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="p-6 space-y-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ===================== OVERVIEW ===================== */}
      <Section title="Overview">
        <Grid>
          <Card title="Net Cash" value={money(stats.balance)} color="bg-teal-600" />
          <Card title="Total Profit" value={money(stats.totalProfit)} color="bg-green-600" />
          <Card title="Total Assets Value" value={money(stats.totalAssetValue)} color="bg-gray-700" />
          <Card title="Capital Invested" value={money(stats.totalCapital)} color="bg-purple-600" />
        </Grid>
      </Section>

      {/* ===================== INCOME STATEMENT ===================== */}
      <Section title="Income Statement (Performance)">
        <Grid>
          <Card title="Today Revenue" value={money(stats.todayRevenue)} color="bg-blue-500" />
          <Card title="Today COGS" value={money(stats.todayCOGS)} color="bg-red-500" />
          <Card title="Today Expenses" value={money(stats.todayExpenses)} color="bg-orange-500" />
          <Card title="Today Profit" value={money(stats.todayProfit)} color="bg-green-600" />

          <Card title="Total Revenue" value={money(stats.totalRevenue)} color="bg-indigo-500" />
          <Card title="Total COGS" value={money(stats.totalCOGS)} color="bg-red-600" />
          <Card title="Total Expenses" value={money(stats.totalExpenses)} color="bg-orange-600" />
          <Card title="Total Profit" value={money(stats.totalProfit)} color="bg-green-700" />
        </Grid>
      </Section>

      {/* ===================== CASH FLOW ===================== */}
      <Section title="Cash Flow (Liquidity)">
        <Grid>
          <Card title="Capital Injections (Net)" value={money(stats.totalCapital)} color="bg-purple-500" />
          <Card title="Stock Purchases (Cash Out)" value={money(stats.totalStockPurchases)} color="bg-yellow-600" />
          <Card title="Capital Expenditure" value={money(stats.totalCapEx)} color="bg-orange-700" />
          <Card title="Net Cash Balance" value={money(stats.balance)} color="bg-teal-700" />
        </Grid>
      </Section>

      {/* ===================== BALANCE SHEET ===================== */}
      <Section title="Balance Sheet">
        <Grid>
          <Card title="Total Assets" value={stats.totalAssets} color="bg-gray-800" />
          <Card
            title="Assets Value"
            value={money(stats.totalAssetValue)}
            color="bg-gray-700"
          />
          <Card title="Total Products" value={stats.totalProducts} color="bg-blue-600" />
          <Card title="Low Stock Items" value={stats.lowStock} color="bg-red-700" />
        </Grid>
      </Section>

      {/* ===================== MANAGEMENT ===================== */}
      <Section title="Management">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NavCard href="/store" title="Inventory" desc="Manage products" />
          <NavCard href="/inventory-transaction" title="Stock Transactions" desc="Purchases & sales" />
          <NavCard href="/capital" title="Capital" desc="Injections & withdrawals" />
          <NavCard href="/asset-management" title="Assets" desc="Fixed assets" />
          <NavCard href="/expenses" title="Expenses" desc="Operating expenses" />
          <NavCard href="/reports" title="Reports" desc="Financial reports" />
          <NavCard href="/users" title="Manage Staffs" desc="Manage your Staffs" />
        </div>
      </Section>
    </div>
  );
}

/* ===================== UI HELPERS ===================== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} text-white p-4 rounded shadow`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function NavCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="p-6 bg-white shadow rounded hover:bg-gray-50">
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 mb-6 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="p-6 text-red-600">
      Failed to load dashboard data. Please refresh.
    </div>
  );
}
