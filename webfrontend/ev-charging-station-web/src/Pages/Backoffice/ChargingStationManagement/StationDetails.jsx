import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Zap, Power, Edit, Calendar, Clock, User, RefreshCw } from 'lucide-react';
import { useChargingStations } from '../../../hooks/useChargingStations';

const StationDetails = () => {
  const { id } = useParams();
  const { fetchStationById, updateAvailableSlots } = useChargingStations();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setStationError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadStation = async () => {
      try {
        setLoading(true);
        const stationData = await fetchStationById(id);
        setStation(stationData);
        setStationError(null);
      } catch (err) {
        setStationError(err.message || 'Failed to fetch station details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStation();
    }
  }, [id, fetchStationById]);

  const handleRefreshSlots = async () => {
    try {
      setRefreshing(true);
      await updateAvailableSlots(id);
      // Reload station data to get updated slot count
      const refreshedStation = await fetchStationById(id);
      setStation(refreshedStation);
    } catch (err) {
      console.error('Failed to refresh slots:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Format location
  const formatAddress = (location) => {
    if (!location) return 'No location specified';
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/manage-stations"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stations
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Station not found'}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(station.status);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/manage-stations"
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stations
        </Link>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshSlots}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Slots
          </button>
          <Link
            to={`/edit-station/${station.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Station
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Station Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Station Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900">{formatAddress(station.location)}</p>
                    {station.location?.latitude && station.location?.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {station.location.latitude.toFixed(6)}, {station.location.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Charging Type</p>
                    <p className="text-gray-900">{station.type === 0 ? 'AC (Alternating Current)' : 'DC (Direct Current)'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Power className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Slots</p>
                    <p className="text-gray-900">
                      {station.availableSlots || 0} available / {station.totalSlots || 0} total
                    </p>
                  </div>
                </div>

                {station.operatingHours && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Operating Hours</p>
                      <p className="text-gray-900">{formatOperatingHours(station.operatingHours)}</p>
                    </div>
                  </div>
                )}

                {station.operatorId && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Operator</p>
                      <p className="text-gray-900">{station.operatorId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-gray-900">
                      {station.createdAt ? new Date(station.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {station.updatedAt && station.updatedAt !== station.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(station.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Station Statistics & Management */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Station Management</h2>
              
              {/* Slot Availability */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Slot Availability</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Slots:</span>
                    <span className="font-medium">{station.totalSlots || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Slots:</span>
                    <span className="font-medium text-green-600">{station.availableSlots || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Occupied Slots:</span>
                    <span className="font-medium text-red-600">
                      {(station.totalSlots || 0) - (station.availableSlots || 0)}
                    </span>
                  </div>
                  
                  {/* Availability Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${station.totalSlots > 0 ? ((station.availableSlots || 0) / station.totalSlots) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Station ID */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Station ID</h3>
                <p className="text-blue-700 font-mono text-sm break-all">{station.id}</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to={`/edit-station/${station.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Station Details
                  </Link>
                  <button
                    onClick={handleRefreshSlots}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Update Available Slots
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;