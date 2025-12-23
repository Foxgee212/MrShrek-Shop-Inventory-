"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";

type DailyNetCash = { _id: { day: number; month: number; year: number }; net: number };
type BestItem = { item: { name: string }; totalQty: number; totalRevenue: number };
type CategorySale = { _id: string; totalRevenue: number; totalQty: number };
type PeriodData = {
  revenue: number;
  COGS: number;
  operatingExpenses: number;
  stockPurchases: number;
  capEx: number;
  profit: number;
  netCash: number;
  salesCount: number;
};

type ReportsData = {
  periods: Record<string, PeriodData>;
  bestSellingItems: BestItem[];
  categorySales: CategorySale[];
  dailySales: any[];
  dailyExpenses: any[];
  netCashDaily: DailyNetCash[];
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/admin/reports/advanced");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) return <div className="p-6">Loading reports...</div>;
  if (error || !reports) return <div className="p-6 text-red-600">Failed to load reports</div>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];
  const formatCurrency = (value?: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value ?? 0);

  const { periods } = reports;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Advanced Reports</h1>
        <Link
          href="/reports/inventory-valuation-report"
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
        >
          📦 Inventory Valuation
        </Link>
      </div>

      {/* PERIOD SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["today", "monthStart", "yearStart", "all"].map((key) => (
          <div key={key} className="p-4 bg-blue-500 text-white rounded shadow">
            <h2 className="text-xl capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
            <p>Revenue: {formatCurrency(periods[key]?.revenue)}</p>
            <p>COGS: {formatCurrency(periods[key]?.COGS)}</p>
            <p>OpEx: {formatCurrency(periods[key]?.operatingExpenses)}</p>
            <p>Stock Purchases: {formatCurrency(periods[key]?.stockPurchases)}</p>
            <p>CapEx: {formatCurrency(periods[key]?.capEx)}</p>
            <p>Profit: {formatCurrency(periods[key]?.profit)}</p>
            <p>Net Cash: {formatCurrency(periods[key]?.netCash)}</p>
            <p>Sales Count: {periods[key]?.salesCount}</p>
          </div>
        ))}
      </div>

      {/* DAILY NET CASH LINE CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Daily Net Cash (Last 30 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={reports.netCashDaily.map(d => ({
              date: `${d._id.day}-${d._id.month}-${d._id.year}`,
              net: d.net,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(val) => formatCurrency(val as number)} />
            <Line type="monotone" dataKey="net" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BEST SELLING ITEMS */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Best-Selling Items (Top 10)</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Quantity Sold</th>
              <th className="p-2 border">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {reports.bestSellingItems.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="p-2 border">{item.item?.name ?? "N/A"}</td>
                <td className="p-2 border">{item.totalQty}</td>
                <td className="p-2 border">{formatCurrency(item.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CATEGORY SALES PIE CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Sales by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reports.categorySales}
              dataKey="totalRevenue"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {reports.categorySales.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => formatCurrency(val as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* DAILY SALES VS EXPENSES CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Daily Revenue vs Expenses (Last 30 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={reports.dailySales.map(sale => {
              const expenseDay = reports.dailyExpenses.find(
                e => e._id.day === sale._id.day &&
                     e._id.month === sale._id.month &&
                     e._id.year === sale._id.year
              );
              return {
                date: `${sale._id.day}-${sale._id.month}-${sale._id.year}`,
                revenue: sale.totalRevenue,
                expenses: expenseDay?.total ?? 0,
              };
            })}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(val) => formatCurrency(val as number)} />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ff4d4f" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
