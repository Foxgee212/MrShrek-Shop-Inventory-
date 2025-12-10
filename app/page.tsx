"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    if (data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/sell";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold text-center mb-6">POS Login</h1>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="text-sm text-gray-600 block mb-1">
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="email"
              type="email"
              required
              className="pl-10 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label htmlFor="password" className="text-sm text-gray-600 block mb-1">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="pl-10 pr-10 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium"
        >
          Login
        </button>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Secure POS Access
        </div>
      </form>
    </div>
  );
}
