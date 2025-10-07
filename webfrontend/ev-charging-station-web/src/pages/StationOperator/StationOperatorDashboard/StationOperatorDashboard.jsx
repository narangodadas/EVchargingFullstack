import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Power, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useChargingStations } from '../../../hooks/useChargingStations';

const StationOperatorDashboard = ({ operatorId = 'default-operator' }) => {
  const { stations, loading, error, fetchStationsByOperator, updateAvailableSlots, setError } = useChargingStations();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    if (operatorId) {
      fetchStationsByOperator(operatorId);
    }
  }, [operatorId, fetchStationsByOperator]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStationsByOperator(operatorId);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh stations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateSlots = async (stationId) => {
    try {
      await updateAvailableSlots(stationId);
    } catch (err) {
      console.error('Failed to update slots:', err);
    }
  };

  // Format location
  const formatAddress = (location) => {
    if (!location) return 'No location';
    const parts = [location.address, location.city, location.district].filter(Boolean);
    return parts.join(', ');
  };

  // Format operating hours
  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return 'Not specified';
    if (operatingHours.isOpen24Hours) return '24/7';
    
    const openTime = operatingHours.openTime ? operatingHours.openTime.substring(0, 5) : '00:00';
    const closeTime = operatingHours.closeTime ? operatingHours.closeTime.substring(0, 5) : '23:59';
    return `${openTime} - ${closeTime}`;
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 0: // Active
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 1: // Inactive
        return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
      case 2: // Maintenance
        return { text: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
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

  // Calculate statistics
  const totalStations = stations.length;
  const activeStations = stations.filter(s => s.status === 0).length;
  const totalSlots = stations.reduce((sum, station) => sum + (station.totalSlots || 0), 0);
  const availableSlots = stations.reduce((sum, station) => sum + (station.availableSlots || 0), 0);
  const occupiedSlots = totalSlots - availableSlots;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Station Operator Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your assigned charging stations</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stations</p>
              <p className="text-2xl font-bold text-gray-900">{totalStations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Power className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-2xl font-bold text-gray-900">{activeStations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900">{availableSlots}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Power className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied Slots</p>
              <p className="text-2xl font-bold text-gray-900">{occupiedSlots}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Station List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Stations</h2>
        </div>
        
        {totalStations === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stations assigned to this operator</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {stations.map((station) => {
                const statusInfo = getStatusInfo(station.status);
                const utilizationRate = station.totalSlots > 0 
                  ? ((station.totalSlots - station.availableSlots) / station.totalSlots * 100).toFixed(1)
                  : 0;

                return (
                  <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{formatAddress(station.location)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        <span>Type: {station.type === 0 ? 'AC' : 'DC'}</span>
                      </div>

                      {station.operatingHours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatOperatingHours(station.operatingHours)}</span>
                        </div>
                      )}
                    </div>

                    {/* Slot Availability */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Slot Availability</span>
                        <span className="font-medium">{utilizationRate}% utilized</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{station.totalSlots || 0}</p>
                          <p className="text-gray-600">Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{station.availableSlots || 0}</p>
                          <p className="text-gray-600">Available</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {(station.totalSlots || 0) - (station.availableSlots || 0)}
                          </p>
                          <p className="text-gray-600">Occupied</p>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${utilizationRate}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateSlots(station.id)}
                        className="flex-1 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 transition-colors"
                      >
                        Update Slots
                      </button>
                      <button
                        onClick={() => setSelectedStation(station)}
                        className="flex-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Station Details Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedStation.name}</h3>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-gray-600">{formatAddress(selectedStation.location)}</p>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <span className="ml-2 text-gray-600">
                  {selectedStation.type === 0 ? 'AC' : 'DC'}
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2 text-gray-600">
                  {getStatusInfo(selectedStation.status).text}
                </span>
              </div>
              <div>
                <span className="font-medium">Slots:</span>
                <span className="ml-2 text-gray-600">
                  {selectedStation.availableSlots || 0}/{selectedStation.totalSlots || 0}
                </span>
              </div>
              <div>
                <span className="font-medium">Operating Hours:</span>
                <p className="text-gray-600">{formatOperatingHours(selectedStation.operatingHours)}</p>
              </div>
              <div>
                <span className="font-medium">Station ID:</span>
                <p className="text-xs text-gray-500 font-mono break-all">{selectedStation.id}</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleUpdateSlots(selectedStation.id)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Update Slots
              </button>
              <button
                onClick={() => setSelectedStation(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationOperatorDashboard;