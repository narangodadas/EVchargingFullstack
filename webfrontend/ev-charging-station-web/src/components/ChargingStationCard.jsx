import React, { useState } from 'react';
import { MapPin, Zap, Power, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const ChargingStationCard = ({ station, onDeactivate, onActivate }) => {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await onDeactivate(station.id);
      setShowDeactivateModal(false);
    } catch (error) {
      alert('Cannot deactivate station with active bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      await onActivate(station.id);
    } catch (error) {
      alert('Failed to activate station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
          <div className="flex space-x-2">
            <Link
              to={`/station/${station.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/edit-station/${station.id}`}
              className="text-green-600 hover:text-green-800"
            >
              <Edit className="h-4 w-4" />
            </Link>
            {station.isActive ? (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="text-red-600 hover:text-red-800"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="text-green-600 hover:text-green-800"
                disabled={loading}
              >
                <Power className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{station.location}</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            <span>Type: {station.type}</span>
          </div>
          <div className="flex items-center">
            <Power className="h-4 w-4 mr-2" />
            <span>Available Slots: {station.availableSlots}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              station.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {station.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-gray-500">
            ID: {station.id}
          </span>
        </div>
      </div>

      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Station"
      >
        <p className="mb-4">Are you sure you want to deactivate this station?</p>
        <div className="flex space-x-2">
          <button
            onClick={handleDeactivate}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deactivating...' : 'Deactivate'}
          </button>
          <button
            onClick={() => setShowDeactivateModal(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ChargingStationCard;