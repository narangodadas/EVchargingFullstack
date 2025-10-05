import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Zap, Power, Edit, Calendar } from 'lucide-react';
import apiService from '../services/api';

const StationDetails = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const stationData = await apiService.getChargingStationById(id);
        setStation(stationData);
      } catch (err) {
        setError('Failed to fetch station details');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Station not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <Link
          to={`/edit-station/${station.id}`}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Station
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                station.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {station.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Station Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900">{station.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-gray-900">{station.type}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Power className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Available Slots</p>
                    <p className="text-gray-900">{station.availableSlots}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-gray-900">
                      {station.createdAt ? new Date(station.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Station Statistics</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {station.totalBookings || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {station.activeBookings || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Bookings</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Station ID</h3>
                <p className="text-blue-700 font-mono">{station.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;