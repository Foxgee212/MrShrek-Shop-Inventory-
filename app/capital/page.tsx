"use client";

import { useEffect, useState } from "react";

type CapitalTransaction = {
  _id: string;
  type: "injection" | "withdrawal";
  amount: number;
  source?: string;
  description?: string;
  createdAt: string;
};

export default function CapitalManagementPage() {
  const [transactions, setTransactions] = useState<CapitalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: "injection",
    amount: 0,
    source: "",
    description: "",
  });
  const [totals, setTotals] = useState({ totalInjections: 0, totalWithdrawals: 0, netCapital: 0 });

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/capital", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data.transactions);
      setTotals({ 
        totalInjections: data.totalInjections, 
        totalWithdrawals: data.totalWithdrawals, 
        netCapital: data.netCapital 
      });
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.amount <= 0) return alert("Amount must be greater than 0");

    try {
      const res = await fetch("/api/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      await res.json();
      setModalOpen(false);
      setForm({ type: "injection", amount: 0, source: "", description: "" });
      fetchTransactions();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Capital Management</h1>

      {/* Net Capital Card */}
      <div className="p-6 bg-green-100 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Net Capital</h2>
          <p className="text-3xl font-bold text-green-700">₦{totals.netCapital.toLocaleString()}</p>
          <p className="text-sm text-gray-600">
            Injections: ₦{totals.totalInjections.toLocaleString()} | Withdrawals: ₦{totals.totalWithdrawals.toLocaleString()}
          </p>
        </div>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          onClick={() => setModalOpen(true)}
        >
          Add Capital
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
        <h2 className="font-semibold text-xl mb-4">Transactions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Source</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b">
                  <td className={`px-4 py-2 font-semibold ${t.type === "injection" ? "text-green-600" : "text-red-600"}`}>
                    {t.type}
                  </td>
                  <td className="px-4 py-2">₦{t.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{t.source || "-"}</td>
                  <td className="px-4 py-2">{t.description || "-"}</td>
                  <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Capital Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg space-y-4 relative">
            <h3 className="text-xl font-semibold">Add Capital Transaction</h3>
            <label htmlFor="capital-type" className="font-medium mb-1 block">
            Transaction Type
            </label>
            <select
            id="capital-type"
            name="type"
            value={form.type}
            onChange={handleFormChange}
            className="w-full p-3 border rounded-xl"
            >
            <option value="injection">Injection</option>
            <option value="withdrawal">Withdrawal</option>
            </select>

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleFormChange}
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="text"
              name="source"
              placeholder="Source (optional)"
              value={form.source}
              onChange={handleFormChange}
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleFormChange}
              className="w-full p-3 border rounded-xl"
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
