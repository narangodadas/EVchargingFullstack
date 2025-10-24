// src/components/Layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Zap,
  Clock,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", to: "/backoffice-dashboard", icon: Home },
  { name: "Bookings", to: "/bookings", icon: Calendar },
  { name: "EV Owners", to: "/ev-owner-management", icon: Users },
  { name: "Stations", to: "/manage-stations", icon: Zap },
  { name: "Schedule", to: "/schedule", icon: Clock },
];

export default function Sidebar({ onLogout }) {
  const [open, setOpen] = useState(true); // true = expanded on large screens
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors
           ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
        }
        onClick={() => setMobileOpen(false)}
      >
        <Icon className="h-5 w-5" />
        <span className={`whitespace-nowrap ${open ? "block" : "hidden"}`}>
          {item.name}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="text-lg font-semibold">EV Charging Admin</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLogout && onLogout()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 transform 
            md:translate-x-0 transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static md:block
          `}
          aria-label="Sidebar"
        >
          <div
            className={`flex flex-col h-screen bg-white border-r border-gray-200 
            ${open ? "w-64" : "w-20"} transition-width duration-200`}
          >
            {/* Header / brand */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white rounded-md h-8 w-8 flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <span className={`font-semibold text-gray-900 ${open ? "block" : "hidden"}`}>
                  EV Admin
                </span>
              </div>

              {/* Expand / collapse (desktop) */}
              <div className="hidden md:flex">
                <button
                  onClick={() => setOpen((s) => !s)}
                  className="p-1 rounded hover:bg-gray-100"
                  title={open ? "Collapse" : "Expand"}
                >
                  {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6h.01M6 12h.01" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-auto px-2 py-4 space-y-1">
              {navItems.map(renderLink)}
            </nav>

            {/* Footer actions */}
            <div className="px-3 py-4 border-t border-gray-100">
              <div className={`flex items-center gap-3 ${open ? "" : "justify-center"}`}>
                <button
                  onClick={() => {
                    // simple example: clear token and call optional onLogout
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    onLogout && onLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span className={`${open ? "block" : "hidden"}`}>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        
          {/* This wrapper doesn't render children; put main content next to Sidebar in layout */}
        
      </div>
    </>
  );
}