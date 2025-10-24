import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChargingStationForm from '../../../Components/ChargingStation/ChargingStationForm';
import { useChargingStations } from '../../../hooks/useChargingStations';
import apiService from '../../../services/api';

const EditStation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateStation } = useChargingStations();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading station with ID:', id);
        const stationData = await apiService.getChargingStationById(id);
        console.log('Loaded station data:', stationData);
        setStation(stationData);
      } catch (err) {
        console.error('Failed to load station:', err);
        setError(err.message || 'Failed to fetch station details');
      } finally {
        setLoading(false);
      }
    };

    loadStation();
  }, [id]);

  const handleSubmit = async (stationData) => {
    try {
      await updateStation(id, stationData);
      navigate('/manage-stations');
    } catch (error) {
      console.error('Failed to update station:', error);
      throw error; // Let the form handle the error display
    }
  };

  const handleCancel = () => {
    navigate('/manage-stations');
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
          <button
            onClick={() => navigate('/manage-stations')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stations
          </button>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Station not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/manage-stations')}
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stations
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Charging Station
          </h1>
          <p className="text-gray-600 mt-1">
            Update details for: <span className="font-medium">{station.name}</span>
          </p>
        </div>
        
        <ChargingStationForm
          station={station}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditStation;