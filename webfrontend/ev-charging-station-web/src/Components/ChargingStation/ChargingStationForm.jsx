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
    });  // Update form data when station prop changes
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              {station ? 'Edit Charging Station' : 'Create New Charging Station'}
            </h2>
            <p className="text-blue-100 mt-2">
              {station ? 'Update station information and settings' : 'Fill in the details to add a new charging station'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {errors.submit && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Save className="h-5 w-5 text-white" />
                </div>
                Basic Information
              </h3>
        
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Station Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength="100"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none`}
                      placeholder="Enter a unique station name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Charging Type *
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value={0}>⚡ AC (Alternating Current)</option>
                      <option value={1}>🔋 DC (Direct Current)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="totalSlots" className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Slots *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="totalSlots"
                      name="totalSlots"
                      value={formData.totalSlots}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.totalSlots 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none`}
                      placeholder="Number of charging slots"
                    />
                  </div>
                  {errors.totalSlots && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.totalSlots}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="location.address" className="block text-sm font-semibold text-gray-700 mb-2">
                    🏠 Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location.address"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.address 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                      } focus:outline-none`}
                      placeholder="Enter complete street address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.city" className="block text-sm font-semibold text-gray-700 mb-2">
                    🏙️ City *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.city 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                      } focus:outline-none`}
                      placeholder="City name"
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.district" className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 District *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location.district"
                      name="location.district"
                      value={formData.location.district}
                      onChange={handleChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.district 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                      } focus:outline-none`}
                      placeholder="District name"
                    />
                  </div>
                  {errors.district && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.district}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.latitude" className="block text-sm font-semibold text-gray-700 mb-2">
                    🌐 Latitude <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="location.latitude"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleChange}
                      step="any"
                      min="-90"
                      max="90"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.latitude 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                      } focus:outline-none`}
                      placeholder="e.g., 6.9271"
                    />
                  </div>
                  {errors.latitude && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.latitude}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.longitude" className="block text-sm font-semibold text-gray-700 mb-2">
                    🌍 Longitude <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="location.longitude"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleChange}
                      step="any"
                      min="-180"
                      max="180"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                        errors.longitude 
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                      } focus:outline-none`}
                      placeholder="e.g., 79.8612"
                    />
                  </div>
                  {errors.longitude && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-purple-500 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Operating Hours
              </h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="operatingHours.isOpen24Hours"
                      name="operatingHours.isOpen24Hours"
                      checked={formData.operatingHours.isOpen24Hours}
                      onChange={handleChange}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label htmlFor="operatingHours.isOpen24Hours" className="ml-3 block text-base font-medium text-gray-900">
                      🕐 Open 24 Hours
                    </label>
                  </div>
                  <p className="ml-8 text-sm text-gray-600 mt-1">
                    Check this if the station operates round the clock
                  </p>
                </div>

                {!formData.operatingHours.isOpen24Hours && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="operatingHours.openTime" className="block text-sm font-semibold text-gray-700 mb-2">
                        🌅 Open Time *
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="operatingHours.openTime"
                          name="operatingHours.openTime"
                          value={formData.operatingHours.openTime}
                          onChange={handleChange}
                          className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 transition-all duration-200 ${
                            errors.openTime 
                              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                          } focus:outline-none`}
                        />
                      </div>
                      {errors.openTime && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {errors.openTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="operatingHours.closeTime" className="block text-sm font-semibold text-gray-700 mb-2">
                        🌙 Close Time *
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="operatingHours.closeTime"
                          name="operatingHours.closeTime"
                          value={formData.operatingHours.closeTime}
                          onChange={handleChange}
                          className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 transition-all duration-200 ${
                            errors.closeTime 
                              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                          } focus:outline-none`}
                        />
                      </div>
                      {errors.closeTime && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {errors.closeTime}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 rounded-xl p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  <Save className="h-5 w-5 mr-3" />
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    station ? '✨ Update Station' : '🚀 Create Station'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-4 rounded-xl hover:from-gray-500 hover:to-gray-600 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <X className="h-5 w-5 mr-3" />
                  Cancel
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Make sure all required fields (*) are filled before submitting</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChargingStationForm;