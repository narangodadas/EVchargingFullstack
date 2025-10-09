import React from "react";
import { Zap, BarChart3, Users, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Welcome to ChargeNet ⚡
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            The all-in-one management platform for EV charging stations and backoffice operations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for EV Management
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <Zap className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Station Monitoring</h3>
            <p className="text-gray-600 text-sm mt-2">
              Track real-time station status, power usage, and operational uptime.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <Clock className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Smart Scheduling</h3>
            <p className="text-gray-600 text-sm mt-2">
              Manage bookings and avoid station conflicts with automatic scheduling tools.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <BarChart3 className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm mt-2">
              Get deep insights on usage trends, revenue, and performance with visual reports.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <Users className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
            <p className="text-gray-600 text-sm mt-2">
              Handle operator and EV owner accounts securely with role-based access control.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose ChargeNet?</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            ChargeNet bridges the gap between EV owners, charging station operators, and backoffice administrators.  
            With a cloud-native infrastructure and real-time analytics, ChargeNet ensures smooth, scalable, and efficient EV charging management across your entire network.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center">
        <p>© {new Date().getFullYear()} ChargeNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;