import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Power, Activity, AlertTriangle } from 'lucide-react';
import { useChargingStations } from '../hooks/useChargingStations';
import ChargingStationCard from '../components/ChargingStationCard';

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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

  const activeStations = stations.filter(station => station.isActive);
  const inactiveStations = stations.filter(station => !station.isActive);
  const totalSlots = stations.reduce((total, station) => total + station.availableSlots, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/create-station"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Station
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Inactive Stations</p>
              <p className="text-2xl font-semibold text-gray-900">{inactiveStations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Power className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSlots}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stations */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Stations</h2>
        {stations.length === 0 ? (
          <div className="text-center py-8">
            <Power className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No charging stations found</p>
            <Link
              to="/create-station"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
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

      {stations.length > 6 && (
        <div className="text-center">
          <Link
            to="/manage-stations"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all stations →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;