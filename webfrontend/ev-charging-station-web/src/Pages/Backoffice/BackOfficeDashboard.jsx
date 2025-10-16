import React, { useEffect, useState } from 'react';
import { Zap, MapPin, Clock, Users, CreditCard, RefreshCw, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../Components/Layout/Sidebar';
import ScheduleSummary from '../../Components/Schedule/ScheduleSummary';
import {
  BarChart2,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const BackofficeDashboard = () => {
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalStations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all required data from your backend
      const [ownersRes, stationsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/evowners`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/ChargingStations`),
      ]);

      const owners = ownersRes.data || [];
      const stations = stationsRes.data || [];

      setStats({
        totalOwners: owners.length,
        totalStations: stations.length,
        totalBookings: 120,
        pendingBookings: 8,
        revenue: 42000,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // Demo chart data
  const revenueData = [
    { month: "Jan", revenue: 3000 },
    { month: "Feb", revenue: 4500 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 7000 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 8000 },
  ];

  const stationUtilizationData = [
    { name: "Station A", utilization: 80 },
    { name: "Station B", utilization: 65 },
    { name: "Station C", utilization: 90 },
    { name: "Station D", utilization: 75 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backoffice Dashboard</h1>
            <p className="text-gray-600">
              Real-time analytics & operational insights for ChargeNet
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard icon={<Users className="text-blue-600" />} label="Total EV Owners" value={stats.totalOwners} />
          <StatCard icon={<Zap className="text-green-600" />} label="Total Stations" value={stats.totalStations} />
          <StatCard icon={<Clock className="text-purple-600" />} label="Total Bookings" value={stats.totalBookings} />
          <StatCard icon={<CreditCard className="text-yellow-600" />} label="Revenue (Rs.)" value={stats.revenue.toLocaleString()} />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue Overview</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Station Utilization Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Station Utilization</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stationUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Description / Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Insights & Recommendations</h2>
          <ul className="pl-6 space-y-2 text-gray-700">
            <li>📈 Revenue growth is steady — consider optimizing high-performing stations.</li>
            <li>⚡ Station C shows highest utilization; monitor for overuse or scheduling conflicts.</li>
            <li>🕒 Pending bookings are manageable, ensure response SLA remains under 5 minutes.</li>
            <li>👥 EV owner registrations are increasing, plan for additional charging slots next quarter.</li>
          </ul>
        </div>
      

      {/* Schedule Summary */}
      <ScheduleSummary />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/manage-stations"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">Manage Stations</h3>
                <p className="text-sm text-blue-700">Create and edit charging stations</p>
              </div>
            </div>
          </a>
          
          <a
            href="/schedule"
            className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">Schedule Management</h3>
                <p className="text-sm text-green-700">Manage schedules and maintenance</p>
              </div>
            </div>
          </a>
          
          <a
            href="/ev-owner-management"
            className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900">EV Owners</h3>
                <p className="text-sm text-purple-700">Manage EV owner accounts</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-lg shadow flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  </div>
);

export default BackofficeDashboard;