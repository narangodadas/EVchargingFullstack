import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Wrench } from 'lucide-react';

const ScheduleCalendar = ({ schedules, onScheduleSelect, selectedStation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  const generateCalendar = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const daySchedules = schedules.filter(schedule => {
        if (selectedStation && schedule.stationId !== selectedStation.id) return false;
        
        const scheduleDate = new Date(schedule.startDate);
        return scheduleDate.getDate() === currentDay.getDate() &&
               scheduleDate.getMonth() === currentDay.getMonth() &&
               scheduleDate.getFullYear() === currentDay.getFullYear();
      });
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: isToday(currentDay),
        schedules: daySchedules
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setCalendarDays(days);
  }, [currentDate, schedules, selectedStation]);

  useEffect(() => {
    generateCalendar();
  }, [generateCalendar]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getScheduleTypeColor = (type) => {
    switch (type) {
      case 'maintenance': return 'bg-red-500';
      case 'operating': return 'bg-blue-500';
      case 'special': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScheduleTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-3 w-3" />;
      case 'operating': return <Clock className="h-3 w-3" />;
      case 'special': return <Calendar className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              min-h-[80px] p-1 border border-gray-200 
              ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              hover:bg-gray-50 cursor-pointer
            `}
          >
            <div className={`
              text-sm mb-1
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'font-bold text-blue-600' : ''}
            `}>
              {day.date.getDate()}
            </div>
            
            {/* Schedule indicators */}
            <div className="space-y-1">
              {day.schedules.slice(0, 2).map((schedule, scheduleIndex) => (
                <div
                  key={scheduleIndex}
                  onClick={() => onScheduleSelect && onScheduleSelect(schedule)}
                  className={`
                    text-xs p-1 rounded text-white cursor-pointer
                    ${getScheduleTypeColor(schedule.type)}
                    hover:opacity-80 truncate
                  `}
                  title={`${schedule.title} - ${schedule.startTime}`}
                >
                  <div className="flex items-center">
                    {getScheduleTypeIcon(schedule.type)}
                    <span className="ml-1 truncate">{schedule.title}</span>
                  </div>
                </div>
              ))}
              
              {day.schedules.length > 2 && (
                <div className="text-xs text-gray-500 px-1">
                  +{day.schedules.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Operating</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Special Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;