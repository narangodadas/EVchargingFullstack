import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const ChargingStationForm = ({ station = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: station?.name || '',
    location: station?.location || '',
    type: station?.type || 'AC',
    availableSlots: station?.availableSlots || 1,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.availableSlots || formData.availableSlots < 1) {
      newErrors.availableSlots = 'Available slots must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        availableSlots: parseInt(formData.availableSlots),
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          placeholder="Enter station name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          placeholder="Enter location address"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
        >
          <option value="AC">AC</option>
          <option value="DC">DC</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="availableSlots" className="block text-sm font-medium text-gray-700">
          Available Slots *
        </label>
        <input
          type="number"
          id="availableSlots"
          name="availableSlots"
          value={formData.availableSlots}
          onChange={handleChange}
          min="1"
          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
            errors.availableSlots ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          placeholder="Enter number of available slots"
        />
        {errors.availableSlots && (
          <p className="mt-1 text-sm text-red-600">{errors.availableSlots}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
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