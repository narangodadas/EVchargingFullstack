import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings, Power, Users, Calendar, LogOut } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Don't show navigation on login page or if not authenticated
  if (location.pathname === '/login' || !token) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Define navigation items based on role
  const getNavItems = () => {
    if (role === "Backoffice") {
      return [
        { path: '/backoffice-dashboard', icon: Home, label: 'Dashboard' },
        { path: '/create-station', icon: Plus, label: 'Create Station' },
        { path: '/manage-stations', icon: Settings, label: 'Manage Stations' },
        { path: '/ev-owner-management', icon: Users, label: 'EV Owners' },
        { path: '/bookings', icon: Calendar, label: 'Bookings' },
      ];
    } else if (role === "StationOperator") {
      return [
        { path: '/operator-dashboard', icon: Home, label: 'Dashboard' },
        { path: '/bookings', icon: Calendar, label: 'Bookings' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Power className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                EV Station Manager
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* User Role and Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {role === "Backoffice" ? "Back Office" : "Station Operator"}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;