import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Power, Activity, AlertTriangle, Settings } from 'lucide-react';
import { useChargingStations } from '../../../hooks/useChargingStations';
import ChargingStationCard from '../../../Components/ChargingStation/ChargingStationCard';

const Dashboard = () => {
  const { 
    stations, 
    loading, 
    error, 
    deactivateStation, 
    activateStation 
  } = useChargingStations();

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

  // Updated to use backend status enum
  const activeStations = stations.filter(station => station.status === 0); // Active
  const inactiveStations = stations.filter(station => station.status === 1); // Inactive
  const maintenanceStations = stations.filter(station => station.status === 2); // Maintenance
  const totalSlots = stations.reduce((total, station) => total + (station.totalSlots || 0), 0);
  const availableSlots = stations.reduce((total, station) => total + (station.availableSlots || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your charging station network</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/manage-stations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Stations
          </Link>
          <Link
            to="/create-station"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Station
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Power className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stations</p>
              <p className="text-2xl font-semibold text-gray-900">{stations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-2xl font-semibold text-gray-900">{activeStations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">{inactiveStations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Power className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{availableSlots}/{totalSlots}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Maintenance</p>
              <p className="text-lg font-semibold text-yellow-900">{maintenanceStations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Utilization Rate</p>
              <p className="text-lg font-semibold text-blue-900">
                {totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Power className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Occupied Slots</p>
              <p className="text-lg font-semibold text-green-900">{totalSlots - availableSlots}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Stations</h2>
          {stations.length > 6 && (
            <Link
              to="/manage-stations"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View all stations →
            </Link>
          )}
        </div>
        
        {stations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Power className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No charging stations found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first charging station</p>
            <Link
              to="/create-station"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create your first station
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.slice(0, 6).map(station => (
              <ChargingStationCard
                key={station.id}
                station={station}
                onDeactivate={deactivateStation}
                onActivate={activateStation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;