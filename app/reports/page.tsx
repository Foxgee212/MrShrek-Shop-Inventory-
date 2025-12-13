"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

type DailySale = {
  _id: {
    day: number;
    month: number;
    year: number;
  };
  total: number;
};

type HourlySale = {
  _id: string;
  total: number;
};

type BestItem = {
  item: {
    name: string;
  };
  totalQty: number;
  totalRevenue: number;
};

type CategorySale = {
  _id: string;
  totalRevenue: number;
};

type ReportsData = {
  todaySales: number;
  weeklySales: number;
  thisMonthSales: number;
  totalRevenue: number;
  totalExpenses: number;
  netCash: number;
  hourlySales: HourlySale[];
  dailySales: DailySale[];
  bestSellingItems: BestItem[];
  categorySales: CategorySale[];
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
      } catch (err) {
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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Reports</h1>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-500 text-white rounded shadow">
          <h2 className="text-xl">Today's Sales</h2>
          <p className="text-2xl font-bold">₦{reports.todaySales}</p>
        </div>

        <div className="p-4 bg-green-500 text-white rounded shadow">
          <h2 className="text-xl">Weekly Sales</h2>
          <p className="text-2xl font-bold">₦{reports.weeklySales}</p>
        </div>

        <div className="p-4 bg-purple-500 text-white rounded shadow">
          <h2 className="text-xl">This Month</h2>
          <p className="text-2xl font-bold">₦{reports.thisMonthSales}</p>
        </div>

        <div className="p-4 bg-red-500 text-white rounded shadow">
          <h2 className="text-xl">Total Revenue</h2>
          <p className="text-2xl font-bold">₦{reports.totalRevenue}</p>
        </div>

        <div className="p-4 bg-emerald-600 text-white rounded shadow">
          <h2 className="text-xl">Net Cash</h2>
          <p className="text-2xl font-bold">₦{reports.netCash}</p>
        </div>

      </div>

      {/* HOURLY SALES (Today's POS activity) */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Hourly Sales (Today)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reports.hourlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" label={{ value: "Hour", position: "insideBottom", offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DAILY SALES (Last 30 days) */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Daily Sales (Last 30 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={reports.dailySales.map(d => ({
              date: `${d._id.day}-${d._id.month}-${d._id.year}`,
              total: d.total
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" />
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
              <th className="p-2 border">Revenue (₦)</th>
            </tr>
          </thead>
          <tbody>
            {reports.bestSellingItems.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="p-2 border">{item.item.name}</td>
                <td className="p-2 border">{item.totalQty}</td>
                <td className="p-2 border">{item.totalRevenue}</td>
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
              fill="#8884d8"
              label
            >
              {reports.categorySales.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
