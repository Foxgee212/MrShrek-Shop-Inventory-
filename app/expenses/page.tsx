"use client";

import { useEffect, useState } from "react";

type Expense = {
  _id: string;
  type: "stock_purchase" | "withdrawal" | "misc";
  amount: number;
  description: string;
  category?: string;
  paymentMethod?: "cash" | "transfer" | "pos";
  reference?: string;
  supplier?: string;
  linkedItemId?: string;
  status?: "approved" | "pending" | "cancelled";
  date: string;
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Omit<Expense, "_id">>({
    type: "misc",
    amount: 0,
    description: "",
    category: "",
    paymentMethod: "cash",
    reference: "",
    supplier: "",
    linkedItemId: "",
    status: "approved",
    date: new Date().toISOString().split("T")[0],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addExpense() {
    if (!form.type || !form.amount) {
      alert("Type and amount are required");
      return;
    }

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save expense");
      return;
    }

    const newExpense = await res.json();
    setExpenses((prev) => [newExpense, ...prev]);

    setForm({
      type: "misc",
      amount: 0,
      description: "",
      category: "",
      paymentMethod: "cash",
      reference: "",
      supplier: "",
      linkedItemId: "",
      status: "approved",
      date: new Date().toISOString().split("T")[0],
    });
  }

  async function loadExpenses() {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
  }

  async function deleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete expense");
      return;
    }

    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      {/* Add Expense */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="font-semibold text-xl mb-4">Record Expense</h2>

        <div className="grid gap-4">
          <label htmlFor="type" className="font-semibold">
            Expense Type
          </label>
          <select
            name="type"
            className="p-3 border rounded-xl"
            value={form.type}
            onChange={handleChange}
          >
            <option value="stock_purchase">Stock Purchase</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="misc">Miscellaneous</option>
          </select>

          <input
            name="amount"
            type="number"
            className="p-3 border rounded-xl"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
          />

          <input
            name="description"
            className="p-3 border rounded-xl"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="category"
            className="p-3 border rounded-xl"
            placeholder="Category (optional)"
            value={form.category}
            onChange={handleChange}
          />
          <label htmlFor="paymentMethod" className="font-semibold">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            className="p-3 border rounded-xl"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="pos">POS</option>
          </select>

          <input
            name="reference"
            className="p-3 border rounded-xl"
            placeholder="Reference (optional)"
            value={form.reference}
            onChange={handleChange}
          />

          <input
            name="supplier"
            className="p-3 border rounded-xl"
            placeholder="Supplier (optional)"
            value={form.supplier}
            onChange={handleChange}
          />

          <input
            name="linkedItemId"
            className="p-3 border rounded-xl"
            placeholder="Linked Item ID (optional)"
            value={form.linkedItemId}
            onChange={handleChange}
          />
          <label htmlFor="status" className="font-semibold">  Expense Status</label>
          <select
            name="status"
            className="p-3 border rounded-xl"
            value={form.status}
            onChange={handleChange}
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <label htmlFor="date" className="font-semibold"> Expense Date</label>
          <input
            name="date"
            type="date"
            className="p-3 border rounded-xl"
            value={form.date}
            onChange={handleChange}
          />

          <button
            onClick={addExpense}
            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800"
          >
            Save Expense
          </button>
        </div>
      </div>

      {/* Expense Listing */}
      <div>
        <h2 className="font-semibold text-xl mb-4">Expenses</h2>
        <div className="space-y-4">
          {expenses.length === 0 && <p className="text-gray-500">No expenses yet...</p>}

          {expenses.map((exp) => (
            <div
              key={exp._id}
              className="p-4 border rounded-2xl flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold capitalize">{exp.type.replace("_", " ")}</p>
                {exp.description && <p className="text-gray-600 text-sm">{exp.description}</p>}
                {exp.category && <p className="text-gray-600 text-sm">Category: {exp.category}</p>}
                {exp.paymentMethod && <p className="text-gray-400 text-sm">Payment: {exp.paymentMethod}</p>}
                <p className="text-gray-400 text-sm">{new Date(exp.date).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="font-bold text-red-600">₦{exp.amount.toLocaleString()}</div>
                <button
                  onClick={() => deleteExpense(exp._id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
