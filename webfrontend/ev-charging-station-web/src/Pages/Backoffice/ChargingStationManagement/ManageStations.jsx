import React, { useState } from 'react';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChargingStations } from '../../../hooks/useChargingStations';
import ChargingStationCard from '../../../Components/ChargingStation/ChargingStationCard';
import Sidebar from '../../../Components/Layout/Sidebar';

const ManageStations = () => {
  const { 
    stations, 
    loading, 
    error, 
    deactivateStation, 
    activateStation,
    fetchStations,
    setError
  } = useChargingStations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStations();
      setError(null);
    } catch (err) {
      console.error('Failed to refresh stations:', err);
    } finally {
      setRefreshing(false);
    }
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
      
      <div className="space-y-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="text-red-700 hover:text-red-900"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

    );
  }

  // Format location for search
  const formatLocationForSearch = (location) => {
    if (!location) return '';
    return `${location.address || ''} ${location.city || ''} ${location.district || ''}`.toLowerCase();
  };

  // Filter stations
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatLocationForSearch(station.location).includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && station.status === 0) ||
                         (statusFilter === 'inactive' && station.status === 1) ||
                         (statusFilter === 'maintenance' && station.status === 2);
    
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === '0' && station.type === 0) ||
                       (typeFilter === '1' && station.type === 1);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 transition-all">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Stations</h1>
          <p className="text-gray-600">View and manage all charging stations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/create-station"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Station
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stations by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="0">AC</option>
              <option value="1">DC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{stations.length}</div>
          <div className="text-sm text-gray-600">Total Stations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {stations.filter(s => s.status === 0).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {stations.filter(s => s.status === 1).length}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {stations.filter(s => s.status === 2).length}
          </div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredStations.length} of {stations.length} stations
        </p>
        
        {filteredStations.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {stations.length === 0 ? 'No stations found. Create your first station!' : 'No stations found matching your criteria'}
            </p>
            {stations.length === 0 && (
              <Link
                to="/create-station"
                className="inline-flex items-center mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Station
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map(station => (
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
    </div></div>
  );
};

export default ManageStations;