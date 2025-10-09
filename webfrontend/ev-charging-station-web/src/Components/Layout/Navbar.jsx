import React, { useState } from "react";
import { Menu, X, Power, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ role }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side: Logo + Brand */}
          <div className="flex items-center space-x-3">
            <Power className="text-primary-600 w-7 h-7" />
            <Link
              to="/"
              className="text-xl font-bold text-blue-800 hover:text-primary-600 transition-colors"
            >
              ChargeNet
            </Link>
          </div>

          {/* Middle: Navigation links (Desktop) */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/stations"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Contact
            </Link>
          </div>

          {/* Right side: Role dashboard + profile */}
          <div className="hidden md:flex items-center space-x-4">
            {role && (
              <Link
                to={
                  role === "Backoffice"
                    ? "/backoffice/dashboard"
                    : "/station/dashboard"
                }
                className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
              >
                {role === "Backoffice" ? "Backoffice Dashboard" : "Operator Dashboard"}
            </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="space-y-2 px-4 py-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/stations"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              Stations
            </Link>
            <Link
              to="/bookings"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              Bookings
            </Link>
            <Link
              to="/pricing"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-primary-600 font-medium"
            >
              Contact
            </Link>

            {role && (
              <Link
                to={
                  role === "Backoffice"
                    ? "/backoffice/dashboard"
                    : "/station/dashboard"
                }
                className="block text-primary-600 font-medium mt-2"
              >
                {role === "Backoffice"
                  ? "Backoffice Dashboard"
                  : "Operator Dashboard"}
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="block text-red-600 font-medium mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;