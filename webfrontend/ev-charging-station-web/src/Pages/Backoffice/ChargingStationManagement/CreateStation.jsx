import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChargingStationForm from '../../../Components/ChargingStation/ChargingStationForm';
import { useChargingStations } from '../../../hooks/useChargingStations';

const CreateStation = () => {
  const navigate = useNavigate();
  const { createStation } = useChargingStations();

  const handleSubmit = async (stationData) => {
    try {
      await createStation(stationData);
      navigate('/manage-stations');
    } catch (error) {
      console.error('Failed to create station:', error);
      throw error; // Let the form handle the error display
    }
  };

  const handleCancel = () => {
    navigate('/manage-stations');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Create New Charging Station</h1>
          <p className="text-gray-600 mt-1">Add a new charging station to your network</p>
        </div>
        
        <ChargingStationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateStation;