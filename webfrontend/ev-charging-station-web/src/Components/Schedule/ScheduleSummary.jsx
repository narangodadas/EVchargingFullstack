import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Wrench, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScheduleSummary = ({ className = '' }) => {
  const [scheduleStats, setScheduleStats] = useState({
    totalSchedules: 0,
    upcomingMaintenances: 0,
    todaySchedules: 0,
    criticalTasks: 0,
    completedThisWeek: 0,
    efficiency: 0
  });

  useEffect(() => {
    // In real implementation, this would fetch from API
    // For now, using mock data
    setScheduleStats({
      totalSchedules: 45,
      upcomingMaintenances: 8,
      todaySchedules: 3,
      criticalTasks: 2,
      completedThisWeek: 12,
      efficiency: 94
    });
  }, []);

  const statCards = [
    {
      title: 'Total Schedules',
      value: scheduleStats.totalSchedules,
      icon: Calendar,
      color: 'blue',
      change: '+5',
      changeType: 'increase'
    },
    {
      title: 'Today\'s Tasks',
      value: scheduleStats.todaySchedules,
      icon: Clock,
      color: 'green',
      change: '2 completed',
      changeType: 'neutral'
    },
    {
      title: 'Upcoming Maintenance',
      value: scheduleStats.upcomingMaintenances,
      icon: Wrench,
      color: 'orange',
      change: 'Next: Tomorrow',
      changeType: 'neutral'
    },
    {
      title: 'Critical Tasks',
      value: scheduleStats.criticalTasks,
      icon: AlertTriangle,
      color: 'red',
      change: 'Urgent attention',
      changeType: 'decrease'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Schedule Overview</h2>
        <Link 
          to="/schedule"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Schedules →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const iconColors = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            orange: 'text-orange-600 bg-orange-100',
            red: 'text-red-600 bg-red-100'
          };

          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${iconColors[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <span className="text-xs text-gray-500">{stat.change}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Weekly Progress</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed Tasks</span>
              <span className="font-medium">{scheduleStats.completedThisWeek}/15</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(scheduleStats.completedThisWeek / 15) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {scheduleStats.completedThisWeek} tasks completed this week
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Efficiency Rate</h3>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Efficiency</span>
              <span className="font-medium">{scheduleStats.efficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${scheduleStats.efficiency}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Based on on-time completion and quality metrics
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Schedule Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Maintenance completed at Station Alpha - </span>
            <span className="text-gray-500 ml-1">2 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Operating hours updated for Station Beta - </span>
            <span className="text-gray-500 ml-1">4 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Scheduled maintenance for Station Gamma - </span>
            <span className="text-gray-500 ml-1">1 day ago</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            to="/schedule" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all activity →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSummary;