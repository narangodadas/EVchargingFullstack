import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBookingsByStation = useCallback(async (stationId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getBookingsByStation(stationId);
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUpcomingBookingsByStation = useCallback(async (stationId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getUpcomingBookingsByStation(stationId);
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch upcoming bookings');
            console.error('Error fetching upcoming bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBookingsByOperator = useCallback(async (operatorId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getBookingsByOperator(operatorId);
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch operator bookings');
            console.error('Error fetching operator bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getBookingStats = useCallback((stationBookings) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const activeBookings = stationBookings.filter(booking =>
            booking.status !== 'Cancelled'
        );

        const todayBookings = activeBookings.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate >= today && bookingDate < tomorrow;
        });

        const upcomingBookings = activeBookings.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate > now && bookingDate <= nextWeek;
        });

        const currentBookings = activeBookings.filter(booking => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            return now >= startTime && now <= endTime;
        });

        return {
            total: activeBookings.length,
            today: todayBookings.length,
            upcoming: upcomingBookings.length,
            current: currentBookings.length,
            todayBookings,
            upcomingBookings,
            currentBookings
        };
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        bookings,
        loading,
        error,
        fetchBookingsByStation,
        fetchUpcomingBookingsByStation,
        fetchBookingsByOperator,
        getBookingStats,
        clearError,
        setError
    };
};