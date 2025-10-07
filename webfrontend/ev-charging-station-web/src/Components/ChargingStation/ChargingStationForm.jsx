import React, { useState } from 'react';
import { Save, X, MapPin, Clock } from 'lucide-react';

const ChargingStationForm = ({ station = null, onSubmit, onCancel }) => {
  // Helper function to format time from backend (removes seconds)
  const formatTime = (timeString) => {
    if (!timeString) return '00:00';
    return timeString.substring(0, 5); // Remove seconds part (HH:MM:SS -> HH:MM)
  };

  const [formData, setFormData] = useState({
    name: station?.name || '',
    location: {
      address: station?.location?.address || '',
      city: station?.location?.city || '',
      district: station?.location?.district || '',
      latitude: station?.location?.latitude || '',
      longitude: station?.location?.longitude || '',
    },
    type: station?.type || 0, // 0 for AC, 1 for DC
    totalSlots: station?.totalSlots || 1,
    operatingHours: {
      openTime: formatTime(station?.operatingHours?.openTime) || '00:00',
      closeTime: formatTime(station?.operatingHours?.closeTime) || '23:59',
      isOpen24Hours: station?.operatingHours?.isOpen24Hours || false,
    },
    operatorId: station?.operatorId || '',
  });

  // Update form data when station prop changes
  React.useEffect(() => {
    if (station) {
      console.log('Station data received in form:', station);
      setFormData({
        name: station.name || '',
        location: {
          address: station.location?.address || '',
          city: station.location?.city || '',
          district: station.location?.district || '',
          latitude: station.location?.latitude || '',
          longitude: station.location?.longitude || '',
        },
        type: station.type || 0,
        totalSlots: station.totalSlots || 1,
        operatingHours: {
          openTime: formatTime(station.operatingHours?.openTime) || '00:00',
          closeTime: formatTime(station.operatingHours?.closeTime) || '23:59',
          isOpen24Hours: station.operatingHours?.isOpen24Hours || false,
        },
        operatorId: station.operatorId || '',
      });
    }
  }, [station]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Station name must be less than 100 characters';
    }

    if (!formData.location.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.location.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (formData.location.latitude && (formData.location.latitude < -90 || formData.location.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.location.longitude && (formData.location.longitude < -180 || formData.location.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.totalSlots || formData.totalSlots < 1 || formData.totalSlots > 50) {
      newErrors.totalSlots = 'Total slots must be between 1 and 50';
    }

    if (!formData.operatingHours.isOpen24Hours) {
      if (!formData.operatingHours.openTime) {
        newErrors.openTime = 'Open time is required if not 24 hours';
      }
      if (!formData.operatingHours.closeTime) {
        newErrors.closeTime = 'Close time is required if not 24 hours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setLoading(true);
      
      // Ensure all required fields are properly formatted
      const submitData = {
        name: formData.name.trim(),
        location: {
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          district: formData.location.district.trim(),
          latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : 0,
          longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : 0,
        },
        type: parseInt(formData.type),
        totalSlots: parseInt(formData.totalSlots),
        operatingHours: formData.operatingHours.isOpen24Hours ? {
          openTime: '00:00:00',
          closeTime: '23:59:59',
          isOpen24Hours: true,
        } : {
          openTime: `${formData.operatingHours.openTime}:00`,
          closeTime: `${formData.operatingHours.closeTime}:00`,
          isOpen24Hours: false,
        },
        ...(formData.operatorId && formData.operatorId.trim() && { operatorId: formData.operatorId.trim() }),
      };

      console.log('Form submit data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.message) {
        setErrors({ submit: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    // Clear error when user starts typing
    const errorKey = name.includes('.') ? name.split('.')[1] : name;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Station Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength="100"
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter station name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Charging Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>AC (Alternating Current)</option>
              <option value={1}>DC (Direct Current)</option>
            </select>
          </div>

          <div>
            <label htmlFor="totalSlots" className="block text-sm font-medium text-gray-700">
              Total Slots *
            </label>
            <input
              type="number"
              id="totalSlots"
              name="totalSlots"
              value={formData.totalSlots}
              onChange={handleChange}
              min="1"
              max="50"
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.totalSlots ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter number of total slots"
            />
            {errors.totalSlots && (
              <p className="mt-1 text-sm text-red-600">{errors.totalSlots}</p>
            )}
          </div>

          <div>
            <label htmlFor="operatorId" className="block text-sm font-medium text-gray-700">
              Operator ID (Optional)
            </label>
            <input
              type="text"
              id="operatorId"
              name="operatorId"
              value={formData.operatorId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter operator ID"
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              type="text"
              id="location.address"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="location.district" className="block text-sm font-medium text-gray-700">
              District *
            </label>
            <input
              type="text"
              id="location.district"
              name="location.district"
              value={formData.location.district}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter district"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">{errors.district}</p>
            )}
          </div>

          <div>
            <label htmlFor="location.latitude" className="block text-sm font-medium text-gray-700">
              Latitude (Optional)
            </label>
            <input
              type="number"
              id="location.latitude"
              name="location.latitude"
              value={formData.location.latitude}
              onChange={handleChange}
              step="any"
              min="-90"
              max="90"
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.latitude ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 6.9271"
            />
            {errors.latitude && (
              <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
            )}
          </div>

          <div>
            <label htmlFor="location.longitude" className="block text-sm font-medium text-gray-700">
              Longitude (Optional)
            </label>
            <input
              type="number"
              id="location.longitude"
              name="location.longitude"
              value={formData.location.longitude}
              onChange={handleChange}
              step="any"
              min="-180"
              max="180"
              className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                errors.longitude ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 79.8612"
            />
            {errors.longitude && (
              <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
            )}
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Operating Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="operatingHours.isOpen24Hours"
              name="operatingHours.isOpen24Hours"
              checked={formData.operatingHours.isOpen24Hours}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="operatingHours.isOpen24Hours" className="ml-2 block text-sm text-gray-900">
              Open 24 Hours
            </label>
          </div>

          {!formData.operatingHours.isOpen24Hours && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="operatingHours.openTime" className="block text-sm font-medium text-gray-700">
                  Open Time *
                </label>
                <input
                  type="time"
                  id="operatingHours.openTime"
                  name="operatingHours.openTime"
                  value={formData.operatingHours.openTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    errors.openTime ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.openTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.openTime}</p>
                )}
              </div>

              <div>
                <label htmlFor="operatingHours.closeTime" className="block text-sm font-medium text-gray-700">
                  Close Time *
                </label>
                <input
                  type="time"
                  id="operatingHours.closeTime"
                  name="operatingHours.closeTime"
                  value={formData.operatingHours.closeTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                    errors.closeTime ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.closeTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.closeTime}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : station ? 'Update Station' : 'Create Station'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center justify-center"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ChargingStationForm;