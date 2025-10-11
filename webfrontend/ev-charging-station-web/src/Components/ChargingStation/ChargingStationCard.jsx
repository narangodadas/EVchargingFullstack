import React, { useState } from 'react';
import { MapPin, Zap, Power, Edit, Trash2, Eye, Clock, User } from 'lucide-react';
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

  // Format the address from location object
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

  // Get status from backend enum
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

  const statusInfo = getStatusInfo(station.status);
  const isActive = station.status === 0; // Active status

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
          <div className="flex space-x-2">
            <Link
              to={`/station/${station.id}`}
              className="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/edit-station/${station.id}`}
              className="text-green-600 hover:text-green-800"
              title="Edit Station"
            >
              <Edit className="h-4 w-4" />
            </Link>
            {isActive ? (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="text-red-600 hover:text-red-800"
                disabled={loading}
                title="Deactivate Station"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="text-green-600 hover:text-green-800"
                disabled={loading}
                title="Activate Station"
              >
                <Power className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{formatAddress(station.location)}</span>
          </div>
          
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            <span>Type: {station.type === 0 ? 'AC' : 'DC'}</span>
          </div>
          
          <div className="flex items-center">
            <Power className="h-4 w-4 mr-2" />
            <span>Slots: {station.availableSlots || 0}/{station.totalSlots || 0}</span>
          </div>

          {station.operatingHours && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatOperatingHours(station.operatingHours)}</span>
            </div>
          )}

          {station.operatorId && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-xs">Operator: {station.operatorId}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
          <span className="text-xs text-gray-500">
            ID: {station.id}
          </span>
        </div>

        {/* Additional info row */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(station.createdAt).toLocaleDateString()}</span>
            {station.updatedAt !== station.createdAt && (
              <span>Updated: {new Date(station.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Station"
      >
        <div className="mb-4">
          <p className="mb-2">Are you sure you want to deactivate this station?</p>
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> You cannot deactivate a station if there are active bookings.
          </p>
        </div>
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