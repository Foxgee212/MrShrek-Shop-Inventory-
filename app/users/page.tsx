"use client";

import { useEffect, useState } from "react";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Add new user
  async function handleAddUser(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      alert("User added");
      setForm({ name: "", email: "", password: "", role: "staff" });
      loadUsers();
    } else {
      alert("Error adding user");
    }
  }

  // Delete user
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadUsers();
    } else {
      alert("Error deleting user");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>

      {/* ADD USER FORM */}
      <form className="text-gray-800 bg-white p-4 rounded shadow mb-8" onSubmit={handleAddUser}>
        <h2 className="text-xl font-bold mb-3">Add New User</h2>

        <input
          className="text-gray-800 border p-2 w-full mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="text-gray-800 border p-2 w-full mb-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="text-gray-800 border p-2 w-full mb-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="text-gray-800 border p-2 w-full mb-4"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>

      {/* USERS TABLE */}
      <h2 className="text-2xl font-bold mb-3">All Users</h2>

      <table className="w-full text-gray-800 bg-white shadow rounded">
        <thead>
          <tr className="text-gray-800 bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u._id}>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2 capitalize">{u.role}</td>
              <td className="border p-2 text-center">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(u._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
