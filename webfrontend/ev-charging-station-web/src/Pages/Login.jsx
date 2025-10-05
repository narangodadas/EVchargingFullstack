import React, { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!nic || !password) {
      setError("NIC and Password are required");
      return;
    }

    try {
      // Call backend API
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        nic,
        password,
      });

      // Example response: { token, role }
      const { token, role } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "Backoffice") {
        window.location.href = "/admin-dashboard";
      } else if (role === "Operator") {
        window.location.href = "/operator-dashboard";
      } else {
        setError("Unknown role. Contact admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          EV Charging System Login
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* NIC Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              NIC
            </label>
            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your NIC"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}