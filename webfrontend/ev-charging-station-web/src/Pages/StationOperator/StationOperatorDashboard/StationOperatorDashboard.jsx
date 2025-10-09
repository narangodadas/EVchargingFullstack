import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Power, MapPin, Clock, AlertCircle, Calendar, Users, Eye } from 'lucide-react';
import { useChargingStations } from '../../../hooks/useChargingStations';
import { useBookings } from '../../../hooks/useBookings';
import apiService from '../../../services/api';

const StationOperatorDashboard = () => {
  const { stations, loading, error, fetchStations, updateAvailableSlots, setError } = useChargingStations();
  const { loading: bookingsLoading, error: bookingsError, getBookingStats } = useBookings();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingStats, setBookingStats] = useState({});
  const [allBookings, setAllBookings] = useState([]);
  
  // State for slot update modal
  const [showSlotUpdateModal, setShowSlotUpdateModal] = useState(false);
  const [slotUpdateStation, setSlotUpdateStation] = useState(null);
  const [newOccupiedSlots, setNewOccupiedSlots] = useState(0);
  const [isUpdatingSlots, setIsUpdatingSlots] = useState(false);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Fetch all bookings for all stations
  const fetchAllBookings = useCallback(async () => {
    try {
      const allBookingsData = await apiService.getAllBookings();
      
      // Add station names to bookings
      const bookingsWithStationNames = allBookingsData.map(booking => {
        const station = stations.find(s => s.id === booking.stationId);
        return {
          ...booking,
          stationName: station ? station.name : 'Unknown Station'
        };
      });
      
      setAllBookings(bookingsWithStationNames);
      
      // Calculate booking stats
      if (bookingsWithStationNames.length > 0) {
        const stats = getBookingStats(bookingsWithStationNames);
        setBookingStats(stats);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      // Set empty arrays to prevent errors
      setAllBookings([]);
      setBookingStats({});
    }
  }, [stations, getBookingStats]);

  // Calculate booking stats when stations change
  useEffect(() => {
    if (stations.length > 0) {
      fetchAllBookings();
    }
  }, [stations, fetchAllBookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStations();
      setError(null);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateSlots = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSlotUpdateStation(station);
      const currentOccupied = (station.totalSlots || 0) - (station.availableSlots || 0);
      setNewOccupiedSlots(currentOccupied);
      setShowSlotUpdateModal(true);
    }
  };

  const handleSlotUpdate = async () => {
    if (!slotUpdateStation) return;
    
    setIsUpdatingSlots(true);
    try {
      // Calculate new available slots
      const newAvailableSlots = (slotUpdateStation.totalSlots || 0) - newOccupiedSlots;
      
      // Call API to update the occupied slots
      await apiService.updateStationSlots(slotUpdateStation.id, {
        occupiedSlots: newOccupiedSlots,
        availableSlots: newAvailableSlots
      });
      
      // Refresh the station data
      await fetchStations();
      
      // Close modal and reset state
      setShowSlotUpdateModal(false);
      setSlotUpdateStation(null);
      setNewOccupiedSlots(0);
    } catch (err) {
      console.error('Failed to update slots:', err);
      setError(err.message || 'Failed to update slots');
    } finally {
      setIsUpdatingSlots(false);
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

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get booking status color
  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get upcoming bookings for a specific station
  const getStationBookings = (stationId) => {
    return allBookings.filter(booking => booking.stationId === stationId);
  };

  if (loading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading && bookingsLoading ? 'Loading stations and bookings...' :
             loading ? 'Loading stations...' : 'Loading bookings...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            {bookingsError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <span>Bookings: {bookingsError}</span>
              </div>
            )}
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
  
  // Booking statistics
  const todayBookings = bookingStats.today || 0;
  const upcomingBookings = bookingStats.upcoming || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Station Operator Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all charging stations</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{todayBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Overview */}
      {upcomingBookings > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings (Next 7 Days)</h2>
              <button
                onClick={() => setShowBookings(!showBookings)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showBookings ? 'Hide' : 'View All'}
              </button>
            </div>
          </div>
          
          {showBookings && (
            <div className="p-6">
              {bookingStats.upcomingBookings && bookingStats.upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {bookingStats.upcomingBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.stationName || 'Station'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                          {booking.status || 'Confirmed'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {booking.vehicleType || 'EV'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bookingStats.upcomingBookings.length > 5 && (
                    <p className="text-sm text-gray-500 text-center mt-4">
                      And {bookingStats.upcomingBookings.length - 5} more bookings...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Station List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Charging Stations</h2>
        </div>
        
        {totalStations === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No charging stations available</p>
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

                    {/* Upcoming Bookings for this station */}
                    {(() => {
                      const stationBookings = getStationBookings(station.id);
                      const upcomingStationBookings = stationBookings.filter(booking => {
                        const startTime = new Date(booking.startTime);
                        const now = new Date();
                        return booking.status !== 'Cancelled' && startTime > now;
                      }).slice(0, 2);

                      return upcomingStationBookings.length > 0 ? (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">Next Bookings</span>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            {upcomingStationBookings.map((booking, index) => (
                              <div key={booking.id || index} className="text-xs text-blue-800">
                                {formatDateTime(booking.startTime)} ({booking.vehicleType || 'EV'})
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}

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
              
              {/* Show bookings for this specific station */}
              {(() => {
                const stationBookings = getStationBookings(selectedStation.id);
                const upcomingStationBookings = stationBookings.filter(booking => {
                  const startTime = new Date(booking.startTime);
                  const now = new Date();
                  return booking.status !== 'Cancelled' && startTime > now;
                }).slice(0, 3);

                return upcomingStationBookings.length > 0 ? (
                  <div>
                    <span className="font-medium">Upcoming Bookings:</span>
                    <div className="mt-2 space-y-2">
                      {upcomingStationBookings.map((booking, index) => (
                        <div key={booking.id || index} className="bg-blue-50 p-2 rounded text-xs">
                          <div className="flex justify-between">
                            <span>{formatDateTime(booking.startTime)}</span>
                            <span className={`px-2 py-1 rounded-full ${getBookingStatusColor(booking.status)}`}>
                              {booking.status || 'Confirmed'}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            {booking.vehicleType || 'Electric Vehicle'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-medium">Upcoming Bookings:</span>
                    <p className="text-gray-500 text-sm">No upcoming bookings</p>
                  </div>
                );
              })()}
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

      {/* Slot Update Modal */}
      {showSlotUpdateModal && slotUpdateStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Slot Availability</h3>
              <button
                onClick={() => setShowSlotUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{slotUpdateStation.name}</h4>
                <p className="text-sm text-gray-600">{formatAddress(slotUpdateStation.location)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Slots</p>
                    <p className="text-xl font-bold text-gray-900">{slotUpdateStation.totalSlots || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currently Available</p>
                    <p className="text-xl font-bold text-green-600">{slotUpdateStation.availableSlots || 0}</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="occupiedSlots" className="block text-sm font-medium text-gray-700 mb-2">
                    Occupied Slots
                  </label>
                  <input
                    type="number"
                    id="occupiedSlots"
                    min="0"
                    max={slotUpdateStation.totalSlots || 0}
                    value={newOccupiedSlots}
                    onChange={(e) => setNewOccupiedSlots(Math.max(0, Math.min(slotUpdateStation.totalSlots || 0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available slots will be: {(slotUpdateStation.totalSlots || 0) - newOccupiedSlots}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Current Status:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Slots:</span>
                    <span className="font-medium">{slotUpdateStation.totalSlots || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Occupied:</span>
                    <span className="font-medium">{(slotUpdateStation.totalSlots || 0) - (slotUpdateStation.availableSlots || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Available:</span>
                    <span className="font-medium">{slotUpdateStation.availableSlots || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">After Update:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-green-700">New Occupied:</span>
                    <span className="font-medium">{newOccupiedSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">New Available:</span>
                    <span className="font-medium">{(slotUpdateStation.totalSlots || 0) - newOccupiedSlots}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleSlotUpdate}
                disabled={isUpdatingSlots}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingSlots ? 'Updating...' : 'Update Slots'}
              </button>
              <button
                onClick={() => setShowSlotUpdateModal(false)}
                disabled={isUpdatingSlots}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StationOperatorDashboard;