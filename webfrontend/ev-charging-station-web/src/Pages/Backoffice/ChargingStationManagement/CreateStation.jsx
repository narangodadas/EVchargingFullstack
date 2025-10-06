import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChargingStationForm from '../../../Components/ChargingStation/ChargingStationForm';
import { useChargingStations } from '../../../hooks/useChargingStations';

const CreateStation = () => {
  const navigate = useNavigate();
  const { createStation } = useChargingStations();

  const handleSubmit = async (stationData) => {
    try {
      await createStation(stationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create station:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Charging Station</h1>
        
        <ChargingStationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateStation;