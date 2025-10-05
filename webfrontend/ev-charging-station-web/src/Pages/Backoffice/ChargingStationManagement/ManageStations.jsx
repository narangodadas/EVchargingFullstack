import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useChargingStations } from '../../../hooks/useChargingStations';
import ChargingStationCard from '../../../Components/ChargingStation/ChargingStationCard';

const ManageStations = () => {
  const { 
    stations, 
    loading, 
    error, 
    deactivateStation, 
    activateStation 
  } = useChargingStations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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

  // Filter stations
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && station.isActive) ||
                         (statusFilter === 'inactive' && !station.isActive);
    
    const matchesType = typeFilter === 'all' || station.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Stations</h1>
        <p className="text-gray-600">View and manage all charging stations</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
          </div>
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
            <p className="text-gray-500">No stations found matching your criteria</p>
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
  );
};

export default ManageStations;