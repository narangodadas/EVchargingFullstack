import React from 'react';
import { Clock, MapPin, Calendar, AlertTriangle } from 'lucide-react';

const ScheduleDetails = ({ schedule, station, onClose, onEdit, onDelete }) => {
  if (!schedule) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{schedule.title}</h2>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(schedule.status)}`}>
                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(schedule.priority)}`}>
                {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Station Information */}
        {station && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Station Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Station Name</p>
                <p className="font-medium">{station.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-medium">{station.type === 0 ? 'AC' : 'DC'} Charging</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    {[station.location?.address, station.location?.city, station.location?.district]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Details */}
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Date & Time
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Start</p>
                  <p className="font-medium">{formatDate(schedule.startDate)}</p>
                  <p className="text-sm text-gray-500">{formatTime(schedule.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End</p>
                  <p className="font-medium">{formatDate(schedule.endDate)}</p>
                  <p className="text-sm text-gray-500">{formatTime(schedule.endTime)}</p>
                </div>
              </div>
            </div>

            {/* Schedule Type and Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Schedule Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{schedule.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recurrence</p>
                  <p className="font-medium capitalize">{schedule.recurrence}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {schedule.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{schedule.description}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(schedule.createdAt).toLocaleDateString()} at {new Date(schedule.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 font-medium">
                  {new Date(schedule.updatedAt).toLocaleDateString()} at {new Date(schedule.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings or Notes */}
          {schedule.priority === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Critical Priority</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This schedule has been marked as critical priority. Please ensure all necessary preparations are made.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            Delete
          </button>
          <button
            onClick={() => onEdit(schedule)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;