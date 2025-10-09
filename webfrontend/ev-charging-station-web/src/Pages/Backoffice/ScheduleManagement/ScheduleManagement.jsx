import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Wrench, Plus, Edit, Trash2, Filter, Search, RefreshCw } from 'lucide-react';
import apiService from '../../../services/api';
import Sidebar from '../../../Components/Layout/Sidebar';
import ScheduleCalendar from '../../../Components/Schedule/ScheduleCalendar';

const ScheduleManagement = () => {
  const [stations, setStations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    stationId: '',
    title: '',
    type: 'maintenance', // maintenance, operating, special
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    recurrence: 'none', // none, daily, weekly, monthly
    status: 'scheduled', // scheduled, in-progress, completed, cancelled
    priority: 'medium' // low, medium, high, critical
  });

  const [operatingHoursForm, setOperatingHoursForm] = useState({
    openTime: '',
    closeTime: '',
    isOpen24Hours: false
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stationsRes] = await Promise.all([
        apiService.getChargingStations(),
      ]);
      
      setStations(stationsRes || []);
      
      // Generate mock schedules for demonstration
      // In real implementation, this would come from the backend
      const mockSchedules = generateMockSchedules(stationsRes || []);
      setSchedules(mockSchedules);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateMockSchedules = (stations) => {
    const scheduleTypes = ['maintenance', 'operating', 'special'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['scheduled', 'in-progress', 'completed'];
    
    const mockSchedules = [];
    
    stations.forEach((station, index) => {
      // Add some sample schedules for each station
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
        
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 8) + 1);
        
        mockSchedules.push({
          id: `schedule-${index}-${i}`,
          stationId: station.id,
          stationName: station.name,
          title: `${scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)]} Task`,
          type: scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)],
          description: 'Routine maintenance and inspection',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
          endTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
          recurrence: 'none',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    return mockSchedules;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || station.status.toString() === statusFilter;
    const matchesType = typeFilter === 'all' || station.type.toString() === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 0: return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 1: return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
      case 2: return { text: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'operating': return <Clock className="h-4 w-4" />;
      case 'special': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatAddress = (location) => {
    if (!location) return 'No location';
    const parts = [location.address, location.city, location.district].filter(Boolean);
    return parts.join(', ');
  };

  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return 'Not specified';
    if (operatingHours.isOpen24Hours) return '24/7';
    
    const openTime = operatingHours.openTime ? operatingHours.openTime.substring(0, 5) : '00:00';
    const closeTime = operatingHours.closeTime ? operatingHours.closeTime.substring(0, 5) : '23:59';
    return `${openTime} - ${closeTime}`;
  };

  const getStationSchedules = (stationId) => {
    return schedules.filter(schedule => schedule.stationId === stationId);
  };

  const handleCreateSchedule = (station) => {
    setSelectedStation(station);
    setScheduleForm({
      stationId: station.id,
      title: '',
      type: 'maintenance',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      recurrence: 'none',
      status: 'scheduled',
      priority: 'medium'
    });
    setIsEditing(false);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm(schedule);
    setIsEditing(true);
    setShowScheduleModal(true);
  };

  const handleUpdateOperatingHours = (station) => {
    setSelectedStation(station);
    setOperatingHoursForm({
      openTime: station.operatingHours?.openTime?.substring(0, 5) || '08:00',
      closeTime: station.operatingHours?.closeTime?.substring(0, 5) || '20:00',
      isOpen24Hours: station.operatingHours?.isOpen24Hours || false
    });
    setShowMaintenanceModal(true);
  };

  const handleSaveSchedule = async () => {
    try {
      // In real implementation, this would call the API
      const newSchedule = {
        ...scheduleForm,
        id: isEditing ? selectedSchedule.id : `schedule-${Date.now()}`,
        stationName: selectedStation.name,
        createdAt: isEditing ? selectedSchedule.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        setSchedules(schedules.map(s => s.id === selectedSchedule.id ? newSchedule : s));
      } else {
        setSchedules([...schedules, newSchedule]);
      }

      setShowScheduleModal(false);
      setSelectedStation(null);
      setSelectedSchedule(null);
    } catch (err) {
      console.error('Failed to save schedule:', err);
      setError('Failed to save schedule');
    }
  };

  const handleSaveOperatingHours = async () => {
    try {
      // Call API to update operating hours
      const updateData = {
        operatingHours: operatingHoursForm
      };

      await apiService.updateChargingStation(selectedStation.id, updateData);
      
      // Update local state
      setStations(stations.map(station => 
        station.id === selectedStation.id 
          ? { ...station, operatingHours: operatingHoursForm }
          : station
      ));

      setShowMaintenanceModal(false);
      setSelectedStation(null);
    } catch (err) {
      console.error('Failed to update operating hours:', err);
      setError('Failed to update operating hours');
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedule data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={handleRefresh} className="text-red-700 hover:text-red-900">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Manage station schedules, operating hours, and maintenance</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="0">Active</option>
                <option value="1">Inactive</option>
                <option value="2">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="0">AC</option>
                <option value="1">DC</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 inline mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Calendar View
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {filteredStations.length} stations found
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <ScheduleCalendar 
            schedules={schedules}
            onScheduleSelect={(schedule) => {
              setSelectedSchedule(schedule);
              // You can add more actions here, like showing a modal
            }}
            selectedStation={null}
          />
        )}

        {/* Station Schedule Cards */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStations.map((station) => {
            const statusInfo = getStatusInfo(station.status);
            const stationSchedules = getStationSchedules(station.id);
            const upcomingSchedules = stationSchedules.filter(s => 
              new Date(`${s.startDate}T${s.startTime}`) > new Date() && s.status !== 'cancelled'
            ).slice(0, 3);

            return (
              <div key={station.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Station Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                    <p className="text-sm text-gray-600">{formatAddress(station.location)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* Station Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{station.type === 0 ? 'AC' : 'DC'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Slots:</span>
                    <span className="ml-2 font-medium">{station.availableSlots}/{station.totalSlots}</span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Operating Hours</span>
                    <button
                      onClick={() => handleUpdateOperatingHours(station)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formatOperatingHours(station.operatingHours)}
                    </span>
                  </div>
                </div>

                {/* Upcoming Schedules */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Upcoming Schedules</span>
                    <button
                      onClick={() => handleCreateSchedule(station)}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      <Plus className="h-3 w-3 inline mr-1" />
                      Add
                    </button>
                  </div>
                  
                  {upcomingSchedules.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingSchedules.map((schedule) => (
                        <div key={schedule.id} className="bg-blue-50 p-2 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                {getTypeIcon(schedule.type)}
                                <span className="ml-1 font-medium">{schedule.title}</span>
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full ${getPriorityColor(schedule.priority)}`}>
                                  {schedule.priority}
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {schedule.startDate} {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleEditSchedule(schedule)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No upcoming schedules</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCreateSchedule(station)}
                    className="flex-1 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100"
                  >
                    <Plus className="h-3 w-3 inline mr-1" />
                    New Schedule
                  </button>
                  <button
                    onClick={() => handleUpdateOperatingHours(station)}
                    className="flex-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded hover:bg-gray-100"
                  >
                    <Clock className="h-3 w-3 inline mr-1" />
                    Hours
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {viewMode === 'list' && filteredStations.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stations found matching your criteria</p>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isEditing ? 'Edit Schedule' : 'Create New Schedule'}
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedStation && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{selectedStation.name}</p>
                    <p className="text-sm text-gray-600">{formatAddress(selectedStation.location)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter schedule title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="operating">Operating</option>
                    <option value="special">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={scheduleForm.startDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={scheduleForm.endDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={scheduleForm.priority}
                      onChange={(e) => setScheduleForm({...scheduleForm, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={scheduleForm.status}
                      onChange={(e) => setScheduleForm({...scheduleForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  {isEditing ? 'Update Schedule' : 'Create Schedule'}
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operating Hours Modal */}
        {showMaintenanceModal && selectedStation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Update Operating Hours</h3>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedStation.name}</p>
                  <p className="text-sm text-gray-600">{formatAddress(selectedStation.location)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isOpen24Hours"
                    checked={operatingHoursForm.isOpen24Hours}
                    onChange={(e) => setOperatingHoursForm({
                      ...operatingHoursForm,
                      isOpen24Hours: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isOpen24Hours" className="text-sm font-medium text-gray-700">
                    Open 24 Hours
                  </label>
                </div>

                {!operatingHoursForm.isOpen24Hours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                      <input
                        type="time"
                        value={operatingHoursForm.openTime}
                        onChange={(e) => setOperatingHoursForm({
                          ...operatingHoursForm,
                          openTime: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                      <input
                        type="time"
                        value={operatingHoursForm.closeTime}
                        onChange={(e) => setOperatingHoursForm({
                          ...operatingHoursForm,
                          closeTime: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSaveOperatingHours}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Update Hours
                </button>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManagement;