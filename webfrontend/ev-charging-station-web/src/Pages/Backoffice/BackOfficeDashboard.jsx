import React, { useEffect, useState } from 'react';
import { Zap, Power, MapPin, Clock, Users, CreditCard, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../Components/Layout/Sidebar';
import ScheduleSummary from '../../Components/Schedule/ScheduleSummary';

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
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/evowners`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ChargingStations`),
        /*axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })*/
      ]);

      const owners = ownersRes.data || [];
      const stations = stationsRes.data || [];
      //const bookings = bookingsRes.data || [];

      //const pending = bookings.filter(b => b.status === 'pending').length;
      //const revenue = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

      setStats({
        totalOwners: owners.length,
        totalStations: stations.length,
        //totalBookings: bookings.length,
        //pendingBookings: pending,
        //revenue,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to fetch statistics');
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
    <div className="flex-1 p-6 space-y-6 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backoffice Dashboard</h1>
          <p className="text-gray-600">Analytics & overview of EV operations</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total EV Owners</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOwners}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Stations</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStations}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">Rs. 1000.00</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <Power className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
        </div>
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

export default BackofficeDashboard;
