import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (stationData) => {
    try {
      await updateStation(id, stationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update station:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Charging Station: {station.name}
        </h1>
        
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