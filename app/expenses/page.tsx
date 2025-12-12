"use client";

import { useEffect, useState } from "react";

type Expense = {
  _id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    type: "",
    amount: "",
    description: "",
    date: "",
  });

  function handleChange(e: any) {
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
      body: JSON.stringify({
        type: form.type,
        amount: Number(form.amount),
        description: form.description,
        date: form.date || new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      alert("Failed to save expense");
      return;
    }

    const newExpense = await res.json();
    setExpenses((prev) => [newExpense, ...prev]);

    setForm({ type: "", amount: "", description: "", date: "" });
  }

  useEffect(() => {
    async function loadExpenses() {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data);
    }
    loadExpenses();
  }, []);

  async function deleteExpense(id: string) {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("Failed to delete expense");
    return;
  }

  setExpenses((prev) => prev.filter((e) => e._id !== id));
}

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      {/* Add Expense */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="font-semibold text-xl mb-4">Record Expense</h2>

        <div className="grid gap-4">

          {/* TYPE */}
          <select
            name="type"
            className="p-3 border rounded-xl"
            value={form.type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="stock_purchase">Stock Purchase</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="misc">Miscellaneous</option>
          </select>

          {/* AMOUNT */}
          <input
            name="amount"
            type="number"
            className="p-3 border rounded-xl"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
          />

          {/* DESCRIPTION */}
          <input
            name="description"
            className="p-3 border rounded-xl"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
          />

          {/* DATE */}
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
          {expenses.length === 0 && (
            <p className="text-gray-500">No expenses yet...</p>
          )}

          {expenses.map((exp) => (
        <div
            key={exp._id}
            className="p-4 border rounded-2xl flex justify-between items-center bg-white shadow"
            >
            <div>
                <p className="font-semibold capitalize">{exp.type.replace("_", " ")}</p>
                <p className="text-gray-600 text-sm">{exp.description}</p>
                <p className="text-gray-400 text-sm">
                {new Date(exp.date).toLocaleDateString()}
                </p>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="font-bold text-red-600">
                ₦{exp.amount.toLocaleString()}
                </div>

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
